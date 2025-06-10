import {
  Controller,
  Get,
  Param,
  NotFoundException,
  BadRequestException,
  UseGuards,
  Patch,
  Body,
} from '@nestjs/common';
import { MobileService } from './mobile.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { User } from 'src/users/user.entity';

@UseGuards(JwtAuthGuard)
@Controller('mobile')
export class MobileController {
  constructor(private readonly mobileService: MobileService) {}

  @Get('delivery-person/:id')
  async checkDeliveryPerson(@Param('id') idParam: string) {
    const id = parseInt(idParam, 10);
    if (isNaN(id)) {
      throw new BadRequestException(
        `L'identifiant fourni n'est pas un nombre valide`,
      );
    }

    const deliveryPerson = await this.mobileService.findDeliveryPersonById(id);

    if (!deliveryPerson) {
      throw new NotFoundException(
        `Aucun livreur trouvé avec l'identifiant ${id}`,
      );
    }

    return {
      firstName: deliveryPerson.user.first_name,
      lastName: deliveryPerson.user.last_name,
      createdAt: deliveryPerson.created_at,
      status: deliveryPerson.status,
    };
  }

  @UseGuards(JwtAuthGuard)
  @Get('my-delivery-ads')
  async getMyDeliveryAds(@CurrentUser() user: User) {
    const ads = await this.mobileService.findDeliveryAdsForUser(user.id);

    return ads.map((ad) => ({
      id: ad.id,
      type: ad.type,
      title: ad.title,
      createdAt: ad.createdAt,
      status: ad.status,
    }));
  }

  @Patch('complete-ad')
  async completeAd(
    @Body() body: { type: 'shopping' | 'delivery'; id: number },
  ) {
    const { type, id } = body;
    const result = await this.mobileService.completeAd(type, id);

    if (!result) {
      throw new NotFoundException(
        `Aucune annonce de type "${type}" avec l'identifiant ${id}`,
      );
    }

    return { success: true, message: 'Annonce marquée comme complétée.' };
  }
}
