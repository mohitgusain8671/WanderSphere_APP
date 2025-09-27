import { Ionicons } from '@expo/vector-icons';
import { formatDistanceToNow } from 'date-fns';
import React, { useEffect, useState } from 'react';
import {
    Alert,
    FlatList,
    KeyboardAvoidingView,
    Platform,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../contexts/ThemeContext';
import { useAppStore } from '../store';
import { ProfileAvatar } from './ui/ProfileAvatar';

interface CommentsScreenProps {
  postId?: string;
  post?: any;
  onClose: () => void;
}

export const CommentsScreen: React.FC<CommentsScreenProps> = ({ postId, post, onClose }) => {
  const { colors, isDarkMode } = useTheme();
  const { user, addComment, getPostComments } = useAppStore();
  const [comment, setComment] = useState('');
  const [comments, setComments] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadComments();
  }, []);

  const loadComments = async () => {
    try {
      setLoading(true);
      // For now, we'll use mock comments since the backend might not have this endpoint
      const mockComments = [
        {
          _id: '1',
          text: 'Amazing view! 🏔️',
          author: { _id: '1', firstName: 'John', lastName: 'Doe', profilePicture: null },
          createdAt: new Date(Date.now() - 3600000).toISOString(),
        },
        {
          _id: '2',
          text: 'Wish I was there! Where is this place?',
          author: { _id: '2', firstName: 'Jane', lastName: 'Smith', profilePicture: null },
          createdAt: new Date(Date.now() - 7200000).toISOString(),
        },
      ];
      setComments(mockComments);
    } catch (error) {
      console.error('Error loading comments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSendComment = async () => {
    if (!comment.trim()) return;

    try {
      const newComment = {
        _id: Date.now().toString(),
        text: comment.trim(),
        author: user,
        createdAt: new Date().toISOString(),
      };

      setComments([newComment, ...comments]);
      setComment('');

      // TODO: Call actual API
      // await addComment(post._id, comment.trim());
    } catch (error) {
      Alert.alert('Error', 'Failed to post comment');
    }
  };

  const renderComment = ({ item: comment }: { item: any }) => (
    <View className="flex-row p-4">
      <ProfileAvatar 
        size={32} 
        userId={comment.author._id}
        style={{ marginRight: 12 }}
      />
      
      <View className="flex-1">
        <View className="flex-row items-center mb-1">
          <Text
            className="font-semibold text-sm mr-2"
            style={{ color: colors.text }}
          >
            {comment.author.firstName} {comment.author.lastName}
          </Text>
          <Text
            className="text-xs"
            style={{ color: colors.textSecondary }}
          >
            {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
          </Text>
        </View>
        
        <Text
          className="text-sm leading-5"
          style={{ color: colors.text }}
        >
          {comment.text}
        </Text>
        
        <View className="flex-row items-center mt-2">
          <TouchableOpacity className="mr-4">
            <Text
              className="text-xs font-semibold"
              style={{ color: colors.textSecondary }}
            >
              Reply
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity>
            <Ionicons 
              name="heart-outline" 
              size={14} 
              color={colors.textSecondary} 
            />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView 
      className="flex-1"
      style={{ backgroundColor: colors.background }}
    >
      {/* Header */}
      <View
        className="flex-row items-center justify-between p-4 border-b"
        style={{ 
          borderBottomColor: isDarkMode ? 'rgba(59, 130, 246, 0.1)' : 'rgba(59, 130, 246, 0.05)'
        }}
      >
        <TouchableOpacity onPress={onClose} className="p-2">
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        
        <Text
          className="text-lg font-bold"
          style={{ color: colors.text }}
        >
          Comments
        </Text>
        
        <View style={{ width: 40 }} />
      </View>

      {/* Comments List */}
      <FlatList
        data={comments}
        renderItem={renderComment}
        keyExtractor={(item) => item._id}
        className="flex-1"
        showsVerticalScrollIndicator={false}
      />

      {/* Comment Input */}
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View
          className="flex-row items-center p-4 border-t"
          style={{ 
            borderTopColor: isDarkMode ? 'rgba(59, 130, 246, 0.1)' : 'rgba(59, 130, 246, 0.05)',
            backgroundColor: colors.background
          }}
        >
          <ProfileAvatar 
            size={32} 
            style={{ marginRight: 12 }}
          />
          
          <TextInput
            value={comment}
            onChangeText={setComment}
            placeholder="Add a comment..."
            placeholderTextColor={colors.textSecondary}
            className="flex-1 px-4 py-2 rounded-full mr-3"
            style={{
              backgroundColor: isDarkMode ? 'rgba(59, 130, 246, 0.1)' : 'rgba(248, 250, 252, 0.8)',
              color: colors.text,
              borderWidth: 1,
              borderColor: isDarkMode ? 'rgba(59, 130, 246, 0.2)' : 'rgba(59, 130, 246, 0.1)',
            }}
            multiline
            maxLength={500}
          />
          
          <TouchableOpacity
            onPress={handleSendComment}
            disabled={!comment.trim()}
            className="w-10 h-10 rounded-full items-center justify-center"
            style={{
              backgroundColor: comment.trim() ? '#3B82F6' : colors.surface,
            }}
          >
            <Ionicons 
              name="send" 
              size={18} 
              color={comment.trim() ? 'white' : colors.textSecondary} 
            />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};