import React, { useState } from 'react';
import { View, Text, Pressable, ActivityIndicator, Alert } from 'react-native';
import { Languages, FileText } from 'lucide-react-native';
import { Typography } from '../../constants/typography';
import { useTheme } from '../../hooks/useTheme';
import { useLanguage } from '../../context/LanguageContext';
import { aiService } from '../../lib/aiService';

interface TranslatablePostProps {
  content: string;
  attachmentUrl?: string | null;
  attachmentName?: string | null;
}

export const TranslatablePost: React.FC<TranslatablePostProps> = ({ content, attachmentUrl, attachmentName }) => {
  const theme = useTheme();
  const { language } = useLanguage();
  const [translatedText, setTranslatedText] = useState<string | null>(null);
  const [isTranslating, setIsTranslating] = useState(false);

  const handleTranslate = async () => {
    // If it's already translated to the current language or translating, do nothing
    if (isTranslating) return;
    
    // Toggle back to original if already translated
    if (translatedText) {
      setTranslatedText(null);
      return;
    }

    let targetLangCode: 'en-IN' | 'hi-IN' | 'te-IN' = 'en-IN';
    if (language === 'hi') targetLangCode = 'hi-IN';
    else if (language === 'te') targetLangCode = 'te-IN';
    else {
      // If language is English, no need to translate from english
      return;
    }

    try {
      setIsTranslating(true);
      const result = await aiService.translateText(content, targetLangCode);
      setTranslatedText(result);
    } catch (err) {
      Alert.alert('Translation Error', 'Failed to translate this message. Make sure the API key is valid.');
    } finally {
      setIsTranslating(false);
    }
  };

  return (
    <View>
      <Text style={[Typography.body, { color: theme.text, marginTop: 12 }]}>
        {translatedText || content}
      </Text>
      
      {/* Show Translate Button only if preferred language is not English */}
      {language !== 'en' && (
        <Pressable onPress={handleTranslate} style={{ flexDirection: 'row', alignItems: 'center', marginTop: 8 }}>
          <Languages size={14} color={theme.primary} />
          <Text style={[Typography.captionSemiBold, { color: theme.primary, marginLeft: 4 }]}>
            {isTranslating ? 'Translating...' : (translatedText ? 'Show Original' : 'Translate to ' + (language === 'hi' ? 'Hindi' : 'Telugu'))}
          </Text>
          {isTranslating && <ActivityIndicator size="small" color={theme.primary} style={{ marginLeft: 8 }} />}
        </Pressable>
      )}

      {attachmentUrl && (
        <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: theme.primary + '15', padding: 12, borderRadius: 8, marginTop: 12 }}>
          <FileText size={20} color={theme.primary} />
          <Text style={[Typography.bodySemiBold, { color: theme.primary, marginLeft: 8 }]} numberOfLines={1}>
            {attachmentName || 'View Material'}
          </Text>
        </View>
      )}
    </View>
  );
};
