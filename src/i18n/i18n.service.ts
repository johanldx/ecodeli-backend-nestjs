import { Injectable, NotFoundException } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class I18nService {
  private readonly localesPath = path.join(process.cwd(), 'locales');

  constructor() {
    if (!fs.existsSync(this.localesPath)) {
      fs.mkdirSync(this.localesPath, { recursive: true });
    }
  }

  private readJsonFile(filePath: string): Record<string, any> | null {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      if (!content.trim()) return null; // vide
      return JSON.parse(content);
    } catch {
      return null; // JSON invalide
    }
  }

  getTranslations(lang: string): Record<string, any> {
    const filePath = path.join(this.localesPath, `${lang}.json`);
    const fallbackPath = path.join(this.localesPath, 'default.json');

    const translations = this.readJsonFile(filePath);
    if (translations) return translations;

    const fallback = this.readJsonFile(fallbackPath);
    if (fallback) return fallback;

    throw new NotFoundException(`Aucune traduction valide pour '${lang}', ni de fallback.`);
  }

  addLanguage(lang: string, translations: Record<string, any>): Record<string, any> {
    if (lang === 'default') {
      throw new NotFoundException(`La langue '${lang}' est protégée.`);
    }

    const filePath = path.join(this.localesPath, `${lang}.json`);
    if (fs.existsSync(filePath)) {
      throw new NotFoundException(`La langue '${lang}' existe déjà.`);
    }

    fs.writeFileSync(filePath, JSON.stringify(translations, null, 2));
    return { success: true, message: `Langue '${lang}' ajoutée.` };
  }

  deleteLanguage(lang: string): Record<string, any> {
    if (lang === 'default') {
      throw new NotFoundException(`La langue '${lang}' est protégée.`);
    }

    const filePath = path.join(this.localesPath, `${lang}.json`);
    if (!fs.existsSync(filePath)) {
      throw new NotFoundException(`Traductions pour '${lang}' non trouvées.`);
    }

    fs.unlinkSync(filePath);
    return { success: true, message: `Langue '${lang}' supprimée.` };
  }

  updateAllTranslations(lang: string, translations: Record<string, any>): Record<string, any> {
    if (lang === 'default') {
      throw new NotFoundException(`La langue '${lang}' est protégée.`);
    }

    const filePath = path.join(this.localesPath, `${lang}.json`);
    if (!fs.existsSync(filePath)) {
      throw new NotFoundException(`Traductions pour '${lang}' non trouvées.`);
    }

    fs.writeFileSync(filePath, JSON.stringify(translations, null, 2));
    return {
      success: true,
      message: `Toutes les traductions de '${lang}' ont été mises à jour.`,
    };
  }

  updateTranslation(lang: string, key: string, value: string): Record<string, any> {
    const filePath = path.join(this.localesPath, `${lang}.json`);
    if (lang === 'default') {
      throw new NotFoundException(`La langue '${lang}' est protégée.`);
    }

    let translations = this.readJsonFile(filePath) || {};

    const keys = key.split('.');
    let obj = translations;

    for (let i = 0; i < keys.length - 1; i++) {
      obj[keys[i]] = obj[keys[i]] || {};
      obj = obj[keys[i]];
    }

    obj[keys[keys.length - 1]] = value;

    fs.writeFileSync(filePath, JSON.stringify(translations, null, 2));
    return {
      success: true,
      message: `Traduction mise à jour : ${key} = ${value}`,
    };
  }

  deleteTranslation(lang: string, key: string): Record<string, any> {
    if (lang === 'default') {
      throw new NotFoundException(`La langue '${lang}' est protégée.`);
    }

    const filePath = path.join(this.localesPath, `${lang}.json`);
    const translations = this.readJsonFile(filePath);

    if (!translations) {
      throw new NotFoundException(`Traductions pour '${lang}' non valides.`);
    }

    const deleteKey = (obj: any, keys: string[]): boolean => {
      if (keys.length === 1) {
        if (obj[keys[0]] !== undefined) {
          delete obj[keys[0]];
          return true;
        }
        return false;
      }
      return obj[keys[0]] && deleteKey(obj[keys[0]], keys.slice(1));
    };

    const keys = key.split('.');
    if (!deleteKey(translations, keys)) {
      throw new NotFoundException(`Clé '${key}' non trouvée dans '${lang}'.`);
    }

    fs.writeFileSync(filePath, JSON.stringify(translations, null, 2));
    return { success: true, message: `Clé '${key}' supprimée.` };
  }

  getAvailableLanguages(): string[] {
    return fs
      .readdirSync(this.localesPath)
      .filter((file) => file.endsWith('.json'))
      .map((file) => path.basename(file, '.json'))
      .filter((lang) => lang !== 'default'); // exclure default
  }
}
