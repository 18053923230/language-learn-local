export interface TranslationResult {
  translatedText: string;
  detectedLanguage?: string;
  confidence?: number;
}

export interface TranslationError {
  message: string;
  code: string;
}

// LibreTranslate public instances
const LIBRE_TRANSLATE_INSTANCES = [
  "https://libretranslate.de/translate",
  "https://translate.argosopentech.com/translate",
  "https://libretranslate.com/translate",
  "https://translate.fortytwo-it.com/translate",
];

// Language code mapping for LibreTranslate
const LANGUAGE_CODES: { [key: string]: string } = {
  en: "en",
  zh: "zh",
  ja: "ja",
  ko: "ko",
  es: "es",
  fr: "fr",
  de: "de",
  it: "it",
  pt: "pt",
  ru: "ru",
  others: "auto", // LibreTranslate will auto-detect
};

class TranslationService {
  private cache = new Map<
    string,
    { result: TranslationResult; timestamp: number }
  >();
  private readonly CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

  // Get cached translation
  private getCachedTranslation(
    text: string,
    from: string,
    to: string
  ): TranslationResult | null {
    const key = `${text}_${from}_${to}`;
    const cached = this.cache.get(key);

    if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
      return cached.result;
    }

    return null;
  }

  // Cache translation result
  private cacheTranslation(
    text: string,
    from: string,
    to: string,
    result: TranslationResult
  ): void {
    const key = `${text}_${from}_${to}`;
    this.cache.set(key, { result, timestamp: Date.now() });
  }

  // Test instance availability
  private async testInstance(
    url: string
  ): Promise<{ url: string; available: boolean; latency: number }> {
    try {
      const start = Date.now();
      const response = await fetch(url, {
        method: "HEAD",
        signal: AbortSignal.timeout(3000), // 减少到3秒超时
      });
      const latency = Date.now() - start;

      return {
        url,
        available: response.ok,
        latency,
      };
    } catch {
      return { url, available: false, latency: Infinity };
    }
  }

  // Get best available instance
  private async getBestInstance(): Promise<string> {
    const promises = LIBRE_TRANSLATE_INSTANCES.map((url) =>
      this.testInstance(url)
    );
    const results = await Promise.all(promises);
    const available = results.filter((r) => r.available);

    if (available.length === 0) {
      throw new Error(
        "No available LibreTranslate instances. Please try again later."
      );
    }

    // Return the fastest available instance
    return available.sort((a, b) => a.latency - b.latency)[0].url;
  }

  // Translate text using a specific instance
  private async translateWithInstance(
    instanceUrl: string,
    text: string,
    from: string,
    to: string
  ): Promise<TranslationResult> {
    const response = await fetch(instanceUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        q: text,
        source: from,
        target: to,
        format: "text",
      }),
      signal: AbortSignal.timeout(8000), // 减少到8秒超时
    });

    if (!response.ok) {
      throw new Error(`Translation failed: ${response.status}`);
    }

    const result = await response.json();

    if (result.error) {
      throw new Error(`Translation error: ${result.error}`);
    }

    return {
      translatedText: result.translatedText,
      detectedLanguage: result.detectedLanguage?.confidence,
      confidence: result.detectedLanguage?.confidence,
    };
  }

  // Main translation method with retry and fallback
  async translate(
    text: string,
    from: string = "auto",
    to: string = "en"
  ): Promise<TranslationResult> {
    // Check cache first
    const cached = this.getCachedTranslation(text, from, to);
    if (cached) {
      return cached;
    }

    // Map language codes
    const sourceLang = LANGUAGE_CODES[from] || from;
    const targetLang = LANGUAGE_CODES[to] || to;

    // Try each instance with retry
    const maxRetries = 2;
    const instances = [...LIBRE_TRANSLATE_INSTANCES];

    for (let attempt = 0; attempt < maxRetries; attempt++) {
      for (const instance of instances) {
        try {
          const result = await this.translateWithInstance(
            instance,
            text,
            sourceLang,
            targetLang
          );

          // Cache successful result
          this.cacheTranslation(text, from, to, result);

          return result;
        } catch (error) {
          console.warn(`Translation failed with instance ${instance}:`, error);
          continue;
        }
      }

      // Wait before retry
      if (attempt < maxRetries - 1) {
        await new Promise((resolve) =>
          setTimeout(resolve, 1000 * (attempt + 1))
        );
      }
    }

    throw new Error("All translation instances failed");
  }

  // Check if translation service is available
  async isAvailable(): Promise<boolean> {
    try {
      await this.getBestInstance();
      return true;
    } catch {
      return false;
    }
  }

  // Get supported languages
  getSupportedLanguages(): { code: string; name: string }[] {
    return Object.entries(LANGUAGE_CODES).map(([code, libCode]) => ({
      code,
      name: this.getLanguageName(code),
    }));
  }

  // Get language name
  private getLanguageName(code: string): string {
    const names: { [key: string]: string } = {
      en: "English",
      zh: "中文",
      ja: "日本語",
      ko: "한국어",
      es: "Español",
      fr: "Français",
      de: "Deutsch",
      it: "Italiano",
      pt: "Português",
      ru: "Русский",
      others: "Others",
    };
    return names[code] || code;
  }

  // Clear cache
  clearCache(): void {
    this.cache.clear();
  }
}

// Export singleton instance
export const translationService = new TranslationService();
