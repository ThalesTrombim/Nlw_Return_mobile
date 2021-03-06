import React, { useState } from 'react';
import { ArrowLeft } from 'phosphor-react-native';
import { captureScreen } from 'react-native-view-shot';
import * as fileSystem from 'expo-file-system';

import { 
    View,
    TextInput,
    Image,
    Text,
    TouchableOpacity
} from 'react-native';

import { theme } from '../../theme';
import { styles } from './styles';
import { FeedbackType } from '../Widget';
import { feedbackTypes } from '../../utils/feedbackTypes';
import { ScreenshotButton } from '../ScreenshotButton';
import { Button } from '../Button';
import { api } from '../../libs/api';

interface Props {
    feedbackType: FeedbackType;
    onFeedbackCanceled: () => void;
    onFeedbackSent: () => void;
}

export function Form({ feedbackType, onFeedbackCanceled, onFeedbackSent }: Props){
  const [ screeshot, setScreenshot ] = useState<string | null>(null);
  const [ isSendingFeedback, setIsSendingFeedback ] = useState(false);
  const [ comment, setComment ] = useState('');

  const feedbackTypeInfo = feedbackTypes[feedbackType];

  function handleScreenshot(){
    captureScreen({
        format: 'png',
        quality: 0.8
    })
    .then(uri => setScreenshot(uri))
    .catch(error => console.log(error))
  }

  function handleScreenshotRemove() {
      setScreenshot(null)
  }

  async function handleSendFeedback() {
    if(isSendingFeedback){
        return;
    }

    setIsSendingFeedback(true);
    const screenshotBase64 = screeshot && await fileSystem.readAsStringAsync(screeshot, { encoding: 'base64'});

    try{
        await api.post('/feedbacks', {
            type: feedbackType,
            screenshot: `data:image/png;base64, ${screenshotBase64}`,
            comment
        })

        onFeedbackSent();
    } catch(err){
        console.log(err)
        setIsSendingFeedback(false)
    }
  }

  return (
    <View style={styles.container}>
        <View style={styles.header}>
            <TouchableOpacity onPress={onFeedbackCanceled}>
                <ArrowLeft 
                    size={24}
                    weight='bold'
                    color={theme.colors.text_secondary}
                />
            </TouchableOpacity>

            <TouchableOpacity style={styles.titleContainer}>
                <Image 
                    source={feedbackTypeInfo.image}
                    style={styles.image}
                />
                <Text style={styles.titleText}>
                    {feedbackTypeInfo.title}
                </Text>
            </TouchableOpacity>
        </View>

        <TextInput 
            multiline
            style={styles.input}
            placeholder="Algo n??o est?? funcionando bem? Queremos corrigir... Conter nos com detalhes o que est?? acontecendo..."
            placeholderTextColor={theme.colors.text_secondary}
            autoCorrect={false}
            onChangeText={setComment}
        />

        <View style={styles.footer}>
            <ScreenshotButton 
                onTakeShot={handleScreenshot}
                onRemoveShot={handleScreenshotRemove}
                screenshot={screeshot}
            />
            <Button 
                onPress={handleSendFeedback}
                isLoading={isSendingFeedback} 
            />
        </View>
    </View>
  );
}