import { Injectable, NotFoundException } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class I18nService {
  private readonly localesPath = path.join(__dirname, 'locales');

  constructor() {
    if (!fs.existsSync(this.localesPath)) {
      fs.mkdirSync(this.localesPath, { recursive: true });
    }
  }

  // Récupérer les traductions pour une langue
  getTranslations(lang: string): Record<string, any> {
    const filePath = path.join(this.localesPath, `${lang}.json`);

    if (!fs.existsSync(filePath)) {
      throw new NotFoundException(`Traductions pour '${lang}' non trouvées.`);
    }

    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  }

  // Ajouter une nouvelle langue (création du fichier)
  addLanguage(lang: string, translations: Record<string, any>): Record<string, any> {
    const filePath = path.join(this.localesPath, `${lang}.json`);

    if (fs.existsSync(filePath)) {
      throw new NotFoundException(`La langue '${lang}' existe déjà.`);
    }

    // Sauvegarder le fichier
    fs.writeFileSync(filePath, JSON.stringify(translations, null, 2));

    return { success: true, message: `Langue '${lang}' ajoutée.` };
  }

  // Supprimer une langue
  deleteLanguage(lang: string): Record<string, any> {
    const filePath = path.join(this.localesPath, `${lang}.json`);

    if (!fs.existsSync(filePath)) {
      throw new NotFoundException(`Traductions pour '${lang}' non trouvées.`);
    }

    // Supprimer le fichier
    fs.unlinkSync(filePath);

    return { success: true, message: `Langue '${lang}' supprimée.` };
  }

  // Modifier tout le fichier d'une langue d'un coup
  updateAllTranslations(lang: string, translations: Record<string, any>): Record<string, any> {
    const filePath = path.join(this.localesPath, `${lang}.json`);

    if (!fs.existsSync(filePath)) {
      throw new NotFoundException(`Traductions pour '${lang}' non trouvées.`);
    }

    // Sauvegarder le fichier complet
    fs.writeFileSync(filePath, JSON.stringify(translations, null, 2));

    return { success: true, message: `Toutes les traductions de '${lang}' ont été mises à jour.` };
  }

  // Ajouter ou modifier une traduction
  updateTranslation(lang: string, key: string, value: string): Record<string, any> {
    const filePath = path.join(this.localesPath, `${lang}.json`);
    let translations = {};

    // Charger les traductions existantes
    if (fs.existsSync(filePath)) {
      translations = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    }

    // Parcourir les clés pour insérer la valeur dans un objet imbriqué
    const keys = key.split('.');
    let obj = translations;

    for (let i = 0; i < keys.length - 1; i++) {
      obj[keys[i]] = obj[keys[i]] || {};
      obj = obj[keys[i]];
    }
    obj[keys[keys.length - 1]] = value;

    // Sauvegarder le fichier
    fs.writeFileSync(filePath, JSON.stringify(translations, null, 2));

    return { success: true, message: `Traduction mise à jour : ${key} = ${value}` };
  }

  // Supprimer une clé de traduction
  deleteTranslation(lang: string, key: string): Record<string, any> {
    const filePath = path.join(this.localesPath, `${lang}.json`);

    if (!fs.existsSync(filePath)) {
      throw new NotFoundException(`Traductions pour '${lang}' non trouvées.`);
    }

    let translations = JSON.parse(fs.readFileSync(filePath, 'utf8'));

    // Fonction récursive pour supprimer la clé
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

    // Sauvegarder les changements
    fs.writeFileSync(filePath, JSON.stringify(translations, null, 2));

    return { success: true, message: `Clé '${key}' supprimée.` };
  }
}
