import { IsNumber, IsNotEmpty } from 'class-validator';

export class CalculateCo2Dto {
	@IsNotEmpty({ message: 'L\'ID de l\'adresse de départ est requis' })
	@IsNumber({}, { message: 'L\'ID de l\'adresse de départ doit être un nombre' })
	fromId: number;

	@IsNotEmpty({ message: 'L\'ID de l\'adresse d\'arrivée est requis' })
	@IsNumber({}, { message: 'L\'ID de l\'adresse d\'arrivée doit être un nombre' })
	toId: number;
} 