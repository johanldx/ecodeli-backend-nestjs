import { Injectable, BadRequestException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Location } from '../locations/entities/location.entity';

@Injectable()
export class Co2CalculatorService {
	constructor(
		private readonly httpService: HttpService,
		@InjectRepository(Location)
		private readonly locationRepository: Repository<Location>
	) {}

	private readonly CO2_EMISSION_FACTOR = 150; // en g/km pour un livreur traditionnel

	/**
	 * Récupère une adresse depuis la base de données.
	 * @param addressId - L'ID de l'adresse
	 * @returns L'adresse complète
	 */
	private async getAddress(addressId: number): Promise<Location> {
		const address = await this.locationRepository.findOne({ where: { id: addressId } });
		if (!address) {
			throw new BadRequestException(`Adresse avec l'ID ${addressId} non trouvée.`);
		}
		return address;
	}

	/**
	 * Récupère les coordonnées géographiques d'une adresse via l'API data.gouv.
	 * @param address - L'adresse à géocoder
	 * @returns Les coordonnées [longitude, latitude]
	 */
	private async geocodeAddress(address: Location): Promise<[number, number]> {
		const addressString = `${address.address}, ${address.cp} ${address.city}`;
		const url = `https://api-adresse.data.gouv.fr/search/?q=${encodeURIComponent(addressString)}&limit=1`;
		
		try {
			const response = await firstValueFrom(this.httpService.get(url));
			const data = response.data as any;
			
			if (!data.features || data.features.length === 0) {
				throw new Error(`Adresse non trouvée: ${addressString}`);
			}
			
			const coordinates = data.features[0].geometry.coordinates;
			return [coordinates[0], coordinates[1]]; // [longitude, latitude]
		} catch (error) {
			console.error(`Erreur de géocodification pour l'adresse "${addressString}":`, error.message);
			throw new BadRequestException(`Impossible de localiser l'adresse: ${addressString}`);
		}
	}

	/**
	 * Calcule la distance entre deux paires de coordonnées géographiques.
	 * @param from - [longitude, latitude] du point de départ
	 * @param to - [longitude, latitude] du point d'arrivée
	 * @returns La distance en kilomètres.
	 */
	private async getDistance(from: [number, number], to: [number, number]): Promise<number> {
		const url = `http://router.project-osrm.org/route/v1/driving/${from.join(',')};${to.join(',')}`;
		
		try {
			const response = await firstValueFrom(this.httpService.get(url));
			const data = response.data as any;
			const distanceInMeters = data.routes[0]?.distance;

			if (!distanceInMeters) {
				throw new Error('Impossible de calculer la route.');
			}
			return distanceInMeters / 1000; // Conversion en kilomètres
		} catch (error) {
			console.error("Erreur de l'API OSRM:", error.message);
			throw new BadRequestException("Impossible de calculer la distance entre les deux adresses.");
		}
	}

	/**
	 * Calcule les émissions de CO2 économisées.
	 * @param distance - La distance en kilomètres.
	 * @returns Le total des émissions de CO2 en grammes.
	 */
	private calculateCo2(distance: number): number {
		return distance * this.CO2_EMISSION_FACTOR;
	}

	/**
	 * Orchestre le calcul complet pour des IDs d'adresses donnés.
	 * @param fromId - ID de l'adresse de départ
	 * @param toId - ID de l'adresse d'arrivée
	 * @returns Un objet avec la distance et les économies de CO2.
	 */
	async calculateSavings(fromId: number, toId: number) {
		const fromAddress = await this.getAddress(fromId);
		const toAddress = await this.getAddress(toId);
		
		const fromCoords = await this.geocodeAddress(fromAddress);
		const toCoords = await this.geocodeAddress(toAddress);
		const distance = await this.getDistance(fromCoords, toCoords);
		const co2Saved = this.calculateCo2(distance);

		return {
			distance: parseFloat(distance.toFixed(2)),
			co2Saved: parseFloat(co2Saved.toFixed(2)),
			co2SavedPerKm: parseFloat((co2Saved / distance).toFixed(2)),
		};
	}
} 