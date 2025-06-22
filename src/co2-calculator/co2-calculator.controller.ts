import { Controller, Get, Query, BadRequestException } from '@nestjs/common';
import { Co2CalculatorService } from './co2-calculator.service';

@Controller('co2-calculator')
export class Co2CalculatorController {
	constructor(private readonly co2CalculatorService: Co2CalculatorService) {}

	@Get('calculate')
	async calculate(@Query('fromId') fromId: string, @Query('toId') toId: string) {
		
		if (!fromId || !toId) {
			throw new BadRequestException('Les IDs des adresses de départ et d\'arrivée sont requis');
		}
		
		const fromIdNum = parseInt(fromId);
		const toIdNum = parseInt(toId);
		
		if (isNaN(fromIdNum) || isNaN(toIdNum)) {
			throw new BadRequestException('Les IDs doivent être des nombres valides');
		}
		
		return this.co2CalculatorService.calculateSavings(fromIdNum, toIdNum);
	}
} 