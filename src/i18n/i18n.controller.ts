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

  @ApiOperation({ summary: "Get translations for a language" })
  @ApiParam({ name: 'lang', example: 'fr', description: 'Language code' })
  @ApiResponse({ status: 200, description: 'Returns translations as JSON' })
  @Get(':lang')
  getTranslations(@Param('lang') lang: string) {
    return this.translationService.getTranslations(lang);
  }

  @ApiOperation({ summary: 'Add a new language' })
  @ApiResponse({ status: 200, description: 'Language added' })
  @ApiResponse({ status: 400, description: 'Language already exists' })
  @Post()
  addLanguage(@Body() addLanguageDto: AddLanguageDto) {
    return this.translationService.addLanguage(addLanguageDto.lang, addLanguageDto.translations);
  }

  @ApiOperation({ summary: 'Delete a language' })
  @ApiParam({ name: 'lang', example: 'en', description: 'Language code' })
  @ApiResponse({ status: 200, description: 'Language deleted' })
  @ApiResponse({ status: 404, description: 'Language not found' })
  @Delete(':lang')
  deleteLanguage(@Param('lang') lang: string) {
    return this.translationService.deleteLanguage(lang);
  }

  @ApiOperation({ summary: 'Update all translations for a language' })
  @ApiParam({ name: 'lang', example: 'fr', description: 'Language code' })
  @ApiResponse({ status: 200, description: 'Translations updated' })
  @ApiResponse({ status: 400, description: 'Invalid translation format' })
  @Put(':lang/all')
  updateAllTranslations(
    @Param('lang') lang: string,
    @Body() translations: Record<string, any>
  ) {
    return this.translationService.updateAllTranslations(lang, translations);
  }

  @ApiOperation({ summary: 'Add or update a translation' })
  @ApiParam({ name: 'lang', example: 'en', description: 'Language code' })
  @ApiResponse({ status: 200, description: 'Translation updated' })
  @ApiResponse({ status: 400, description: 'Invalid translation key or value' })
  @Put(':lang/translation')
  updateTranslation(
    @Param('lang') lang: string,
    @Body() updateTranslationDto: UpdateTranslationDto
  ) {
    return this.translationService.updateTranslation(lang, updateTranslationDto.key, updateTranslationDto.value);
  }

  @ApiOperation({ summary: 'Delete a translation' })
  @ApiParam({ name: 'lang', example: 'en', description: 'Language code' })
  @ApiResponse({ status: 200, description: "Translation key deleted" })
  @ApiResponse({ status: 404, description: 'Translation key not found' })
  @Delete(':lang/translation')
  deleteTranslation(
    @Param('lang') lang: string,
    @Body() deleteTranslationDto: DeleteTranslationDto
  ) {
    return this.translationService.deleteTranslation(lang, deleteTranslationDto.key);
  }

  @ApiOperation({ summary: 'Get the list of available languages' })
  @ApiResponse({ status: 200, description: 'List of available languages' })
  @ApiResponse({ status: 404, description: 'No languages available' })
  @Get()
  getAvailableLanguages() {
    return this.translationService.getAvailableLanguages();
  }
}