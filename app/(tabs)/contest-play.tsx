import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useTheme } from '../../contexts/ThemeContext';
import { useAppStore } from '../../store';
import { router, useLocalSearchParams } from 'expo-router';

export default function ContestPlayScreen() {
  const { colors } = useTheme();
  const { contestId } = useLocalSearchParams();
  const {
    currentContest,
    contestProgress,
    isContestLoading,
    saveContestProgress,
    submitContest,
    uploadContestTaskPhoto,
  } = useAppStore();

  const [answers, setAnswers] = useState<any[]>([]);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<{ [key: number]: number }>({});
  const [isUploading, setIsUploading] = useState<{ [key: number]: boolean }>({});
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    // Check if contest is started
    if (!contestProgress && currentContest) {
      Alert.alert(
        'Contest Not Started',
        'Please start the contest from the contest details page first.',
        [
          {
            text: 'Go Back',
            onPress: () => router.back(),
          },
        ]
      );
      return;
    }

    // Only initialize answers once when component mounts
    if (!isInitialized && currentContest?.questions) {
      // Create empty answer array for all questions
      const initialAnswers = currentContest.questions.map(() => ({}));
      
      // If there's saved progress, merge it with the empty array
      if (contestProgress?.answers && contestProgress.answers.length > 0) {
        contestProgress.answers.forEach((savedAnswer: any) => {
          if (savedAnswer.questionIndex !== undefined) {
            initialAnswers[savedAnswer.questionIndex] = savedAnswer;
          }
        });
      }
      
      setAnswers(initialAnswers);
      setIsInitialized(true);
    }
  }, [contestProgress, currentContest, isInitialized]);

  const handleAnswerChange = (index: number, answer: any) => {
    const newAnswers = [...answers];
    newAnswers[index] = { ...newAnswers[index], ...answer };
    setAnswers(newAnswers);
    setHasUnsavedChanges(true);
  };

  const handleImagePick = async (index: number) => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Denied', 'We need camera roll permissions to upload photos.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      const imageUri = result.assets[0].uri;
      
      // Set uploading state
      setIsUploading(prev => ({ ...prev, [index]: true }));
      setUploadProgress(prev => ({ ...prev, [index]: 0 }));
      
      // Simulate progress (since axios doesn't provide real progress for FormData in React Native)
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          const currentProgress = prev[index] || 0;
          if (currentProgress < 90) {
            return { ...prev, [index]: currentProgress + 10 };
          }
          return prev;
        });
      }, 200);
      
      try {
        // Upload to S3
        const uploadResult = await uploadContestTaskPhoto(imageUri);
        
        clearInterval(progressInterval);
        setUploadProgress(prev => ({ ...prev, [index]: 100 }));
        
        if (uploadResult.success) {
          // Store the S3 URL instead of local URI
          handleAnswerChange(index, {
            questionIndex: index,
            taskSubmission: uploadResult.data.url,
            taskSubmissionType: 'photo',
            type: 'task',
          });
          
          // Clear progress after a short delay
          setTimeout(() => {
            setIsUploading(prev => ({ ...prev, [index]: false }));
            setUploadProgress(prev => ({ ...prev, [index]: 0 }));
          }, 1000);
        } else {
          setIsUploading(prev => ({ ...prev, [index]: false }));
          setUploadProgress(prev => ({ ...prev, [index]: 0 }));
          Alert.alert('Upload Failed', uploadResult.error || 'Failed to upload photo. Please try again.');
        }
      } catch (error) {
        clearInterval(progressInterval);
        setIsUploading(prev => ({ ...prev, [index]: false }));
        setUploadProgress(prev => ({ ...prev, [index]: 0 }));
        Alert.alert('Upload Failed', 'An error occurred while uploading. Please try again.');
      }
    }
  };

  const handleSaveProgress = async () => {
    const result = await saveContestProgress(contestId as string, answers);
    if (result.success) {
      setHasUnsavedChanges(false);
      Alert.alert('Success', 'Progress saved successfully');
    } else {
      Alert.alert('Error', result.error || 'Failed to save progress');
    }
  };

  const handleSubmit = () => {
    Alert.alert(
      'Submit Contest',
      'Are you sure you want to submit? You cannot change your answers after submission.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Submit',
          style: 'destructive',
          onPress: async () => {
            const result = await submitContest(contestId as string, answers);
            if (result.success) {
              router.replace({
                pathname: '/(tabs)/contest-result',
                params: {
                  score: result.data.totalScore,
                  contestId,
                },
              } as any);
            } else {
              Alert.alert('Error', result.error || 'Failed to submit contest');
            }
          },
        },
      ]
    );
  };

  if (!currentContest) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#3B82F6" />
      </View>
    );
  }

  const progress = (answers.filter(a => a.selectedAnswer !== undefined || a.taskSubmission).length / currentContest.questions.length) * 100;

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      {/* Header */}
      <View style={{ backgroundColor: colors.surface, padding: 20, paddingTop: 60 }}>
        <TouchableOpacity 
          onPress={() => {
            if (hasUnsavedChanges) {
              Alert.alert(
                'Unsaved Changes',
                'You have unsaved changes. Do you want to save before leaving?',
                [
                  { text: 'Cancel', style: 'cancel' },
                  { text: 'Leave', style: 'destructive', onPress: () => router.back() },
                  { text: 'Save & Leave', onPress: async () => {
                    await handleSaveProgress();
                    router.back();
                  }},
                ]
              );
            } else {
              router.back();
            }
          }}
          style={{ marginBottom: 16, flexDirection: 'row', alignItems: 'center' }}
        >
          <Ionicons name="arrow-back" size={24} color={colors.text} />
          <Text style={{ marginLeft: 8, fontSize: 16, color: colors.text, fontWeight: '600' }}>
            Back
          </Text>
        </TouchableOpacity>
        
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <Text style={{ fontSize: 18, fontWeight: '700', color: colors.text }}>
            {currentContest.title}
          </Text>
          {hasUnsavedChanges && (
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: '#F59E0B', marginRight: 6 }} />
              <Text style={{ fontSize: 12, color: '#F59E0B' }}>
                Unsaved
              </Text>
            </View>
          )}
        </View>

        {/* Progress Bar */}
        <View style={{ height: 8, backgroundColor: colors.background, borderRadius: 4, overflow: 'hidden' }}>
          <View style={{ height: '100%', width: `${progress}%`, backgroundColor: '#3B82F6', borderRadius: 4 }} />
        </View>
        <Text style={{ fontSize: 12, color: colors.textSecondary, marginTop: 4 }}>
          {answers.filter(a => a.selectedAnswer !== undefined || a.taskSubmission).length} of {currentContest.questions.length} answered
        </Text>
      </View>

      <ScrollView style={{ flex: 1 }}>
        <View style={{ padding: 20, gap: 20 }}>
          {currentContest.questions.map((question: any, index: number) => (
            <View
              key={index}
              style={{
                backgroundColor: colors.surface,
                borderRadius: 16,
                padding: 20,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 4,
                elevation: 2,
              }}
            >
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 }}>
                <Text style={{ fontSize: 14, fontWeight: '700', color: '#3B82F6' }}>
                  Question {index + 1}
                </Text>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Ionicons name="star" size={16} color="#F59E0B" />
                  <Text style={{ marginLeft: 4, fontSize: 14, fontWeight: '600', color: colors.text }}>
                    {question.points} pts
                  </Text>
                </View>
              </View>

              <Text style={{ fontSize: 16, fontWeight: '600', color: colors.text, marginBottom: 16, lineHeight: 22 }}>
                {question.question}
              </Text>

              {question.type === 'mcq' ? (
                <View style={{ gap: 10 }}>
                  {question.options.map((option: string, optIndex: number) => (
                    <TouchableOpacity
                      key={optIndex}
                      onPress={() => handleAnswerChange(index, { questionIndex: index, selectedAnswer: optIndex, type: 'mcq' })}
                      style={{
                        backgroundColor: answers[index]?.selectedAnswer === optIndex ? '#3B82F6' : colors.background,
                        padding: 16,
                        borderRadius: 12,
                        borderWidth: 2,
                        borderColor: answers[index]?.selectedAnswer === optIndex ? '#3B82F6' : 'transparent',
                      }}
                    >
                      <Text
                        style={{
                          fontSize: 14,
                          color: answers[index]?.selectedAnswer === optIndex ? 'white' : colors.text,
                          fontWeight: answers[index]?.selectedAnswer === optIndex ? '600' : '400',
                        }}
                      >
                        {option}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              ) : (
                <View>
                  <Text style={{ fontSize: 14, color: colors.textSecondary, marginBottom: 8 }}>
                    {question.taskDescription}
                  </Text>
                  
                  {question.taskType === 'photo' ? (
                    <View>
                      {isUploading[index] ? (
                        <View
                          style={{
                            backgroundColor: colors.background,
                            padding: 40,
                            borderRadius: 12,
                            alignItems: 'center',
                            borderWidth: 2,
                            borderColor: '#8B5CF6',
                          }}
                        >
                          <ActivityIndicator size="large" color="#8B5CF6" />
                          <Text style={{ marginTop: 16, fontSize: 14, color: colors.text, fontWeight: '600' }}>
                            Uploading Photo...
                          </Text>
                          <View style={{ width: '100%', marginTop: 12 }}>
                            <View style={{ 
                              height: 8, 
                              backgroundColor: colors.surface, 
                              borderRadius: 4, 
                              overflow: 'hidden' 
                            }}>
                              <View style={{ 
                                height: '100%', 
                                width: `${uploadProgress[index] || 0}%`, 
                                backgroundColor: '#8B5CF6', 
                                borderRadius: 4 
                              }} />
                            </View>
                            <Text style={{ 
                              marginTop: 4, 
                              fontSize: 12, 
                              color: colors.textSecondary, 
                              textAlign: 'center' 
                            }}>
                              {uploadProgress[index] || 0}%
                            </Text>
                          </View>
                        </View>
                      ) : answers[index]?.taskSubmission ? (
                        <View>
                          <Image
                            source={{ uri: answers[index].taskSubmission }}
                            style={{
                              width: '100%',
                              height: 200,
                              borderRadius: 12,
                              marginBottom: 12,
                            }}
                            resizeMode="cover"
                          />
                          <TouchableOpacity
                            onPress={() => handleImagePick(index)}
                            disabled={isUploading[index]}
                            style={{
                              backgroundColor: '#8B5CF6',
                              paddingVertical: 12,
                              borderRadius: 8,
                              alignItems: 'center',
                              opacity: isUploading[index] ? 0.5 : 1,
                            }}
                          >
                            <Text style={{ color: 'white', fontSize: 14, fontWeight: '600' }}>
                              Change Photo
                            </Text>
                          </TouchableOpacity>
                        </View>
                      ) : (
                        <TouchableOpacity
                          onPress={() => handleImagePick(index)}
                          disabled={isUploading[index]}
                          style={{
                            backgroundColor: colors.background,
                            padding: 40,
                            borderRadius: 12,
                            alignItems: 'center',
                            borderWidth: 2,
                            borderColor: '#8B5CF6',
                            borderStyle: 'dashed',
                            opacity: isUploading[index] ? 0.5 : 1,
                          }}
                        >
                          <Ionicons name="camera" size={48} color="#8B5CF6" />
                          <Text style={{ marginTop: 12, fontSize: 14, color: '#8B5CF6', fontWeight: '600' }}>
                            Upload Photo
                          </Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  ) : (
                    <TextInput
                      style={{
                        backgroundColor: colors.background,
                        padding: 12,
                        borderRadius: 8,
                        color: colors.text,
                        minHeight: 100,
                        textAlignVertical: 'top',
                      }}
                      placeholder={`Enter your ${question.taskType} submission...`}
                      placeholderTextColor={colors.textSecondary}
                      value={answers[index]?.taskSubmission || ''}
                      onChangeText={(text) => handleAnswerChange(index, {
                        questionIndex: index,
                        taskSubmission: text,
                        taskSubmissionType: question.taskType,
                        type: 'task',
                      })}
                      multiline
                    />
                  )}
                </View>
              )}
            </View>
          ))}
        </View>
      </ScrollView>

      {/* Action Buttons */}
      <View style={{ backgroundColor: colors.surface, padding: 20, gap: 12, marginBottom: 50 }}>
        {Object.values(isUploading).some(uploading => uploading) && (
          <View style={{ 
            backgroundColor: '#FEF3C7', 
            padding: 12, 
            borderRadius: 8, 
            flexDirection: 'row', 
            alignItems: 'center' 
          }}>
            <Ionicons name="cloud-upload" size={20} color="#F59E0B" />
            <Text style={{ marginLeft: 8, fontSize: 12, color: '#92400E', flex: 1 }}>
              Photo upload in progress. Please wait before submitting.
            </Text>
          </View>
        )}
        
        <TouchableOpacity
          onPress={handleSaveProgress}
          disabled={!hasUnsavedChanges || isContestLoading || Object.values(isUploading).some(uploading => uploading)}
          style={{
            backgroundColor: hasUnsavedChanges ? '#F59E0B' : colors.background,
            paddingVertical: 14,
            borderRadius: 12,
            alignItems: 'center',
            opacity: (hasUnsavedChanges && !Object.values(isUploading).some(uploading => uploading)) ? 1 : 0.5,
          }}
        >
          {isContestLoading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text style={{ color: 'white', fontSize: 14, fontWeight: '700' }}>
              Save Progress
            </Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handleSubmit}
          disabled={isContestLoading || Object.values(isUploading).some(uploading => uploading)}
          style={{
            backgroundColor: '#3B82F6',
            paddingVertical: 16,
            borderRadius: 12,
            alignItems: 'center',
            opacity: Object.values(isUploading).some(uploading => uploading) ? 0.5 : 1,
          }}
        >
          <Text style={{ color: 'white', fontSize: 16, fontWeight: '700' }}>
            Submit Contest
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
