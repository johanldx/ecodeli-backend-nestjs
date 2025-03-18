import { Controller, Get, Param, Post, Put, Delete, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger';
import { I18nService } from './i18n.service';
import { UpdateTranslationDto } from './dto/update-translation.dto';
import { DeleteTranslationDto } from './dto/delete-translation.dto';
import { AddLanguageDto } from './dto/add-language.dto';

@ApiTags('Langs')
@Controller('langs')
export class I18nController {
  constructor(private readonly translationService: I18nService) {}

  @ApiOperation({ summary: "Obtenir les traductions d'une langue" })
  @ApiParam({ name: 'lang', example: 'fr', description: 'Code de la langue' })
  @ApiResponse({ status: 200, description: 'Renvoie les traductions en JSON' })
  @Get(':lang')
  getTranslations(@Param('lang') lang: string) {
    return this.translationService.getTranslations(lang);
  }

  @ApiOperation({ summary: 'Ajouter une nouvelle langue' })
  @ApiParam({ name: 'lang', example: 'en', description: 'Code de la langue' })
  @ApiResponse({ status: 200, description: 'Langue ajoutée' })
  @Post() // Changement de PUT à POST
  addLanguage(@Body() addLanguageDto: AddLanguageDto) {
    return this.translationService.addLanguage(addLanguageDto.lang, addLanguageDto.translations);
  }

  @ApiOperation({ summary: 'Supprimer une langue' })
  @ApiParam({ name: 'lang', example: 'en', description: 'Code de la langue' })
  @ApiResponse({ status: 200, description: 'Langue supprimée' })
  @Delete(':lang')
  deleteLanguage(@Param('lang') lang: string) {
    return this.translationService.deleteLanguage(lang);
  }

  @ApiOperation({ summary: 'Modifier toutes les traductions d\'une langue' })
  @ApiParam({ name: 'lang', example: 'fr', description: 'Code de la langue' })
  @ApiResponse({ status: 200, description: 'Traductions mises à jour' })
  @Put(':lang/all')
  updateAllTranslations(
    @Param('lang') lang: string,
    @Body() translations: Record<string, any>
  ) {
    return this.translationService.updateAllTranslations(lang, translations);
  }

  @ApiOperation({ summary: 'Ajouter ou modifier une traduction' })
  @ApiParam({ name: 'lang', example: 'en', description: 'Code de la langue' })
  @ApiResponse({ status: 200, description: 'Traduction mise à jour' })
  @Put(':lang/translation')
  updateTranslation(
    @Param('lang') lang: string,
    @Body() updateTranslationDto: UpdateTranslationDto
  ) {
    return this.translationService.updateTranslation(lang, updateTranslationDto.key, updateTranslationDto.value);
  }

  @ApiOperation({ summary: 'Supprimer une traduction' })
  @ApiParam({ name: 'lang', example: 'en', description: 'Code de la langue' })
  @ApiResponse({ status: 200, description: "Clé de traduction supprimée" })
  @Delete(':lang/translation')
  deleteTranslation(
    @Param('lang') lang: string,
    @Body() deleteTranslationDto: DeleteTranslationDto
  ) {
    return this.translationService.deleteTranslation(lang, deleteTranslationDto.key);
  }
}
