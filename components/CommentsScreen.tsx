import { Ionicons } from '@expo/vector-icons';
import { formatDistanceToNow } from 'date-fns';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
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
import { COLORS } from '../utils/constants';
import { ProfileAvatar } from './ui/ProfileAvatar';

interface CommentsScreenProps {
  postId: string;
  onClose: () => void;
}

export const CommentsScreen: React.FC<CommentsScreenProps> = ({ postId, onClose }) => {
  const { colors, isDarkMode } = useTheme();
  const { user, addComment, getComments } = useAppStore();
  const [comment, setComment] = useState('');
  const [comments, setComments] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);

  useEffect(() => {
    loadComments();
  }, []);

  const loadComments = async (pageNum = 1) => {
    try {
      if (pageNum === 1) {
        setLoading(true);
      }

      const result = await getComments(postId, pageNum);
      
      if (result.success) {
        if (pageNum === 1) {
          setComments(result.data);
        } else {
          setComments(prev => [...prev, ...result.data]);
        }
        setHasMore(result.hasMore);
        setPage(pageNum);
      } else {
        Alert.alert('Error', result.error || 'Failed to load comments');
      }
    } catch (error) {
      console.error('Error loading comments:', error);
      Alert.alert('Error', 'Failed to load comments');
    } finally {
      setLoading(false);
    }
  };

  const loadMoreComments = () => {
    if (hasMore && !loading) {
      loadComments(page + 1);
    }
  };

  const handleSendComment = async () => {
    if (!comment.trim() || submitting) return;

    try {
      setSubmitting(true);
      
      const result = await addComment(postId, comment.trim());
      
      if (result.success) {
        setComments([result.data, ...comments]);
        setComment('');
      } else {
        Alert.alert('Error', result.error || 'Failed to post comment');
      }
    } catch (error) {
      console.error('Error posting comment:', error);
      Alert.alert('Error', 'Failed to post comment');
    } finally {
      setSubmitting(false);
    }
  };

  const renderComment = ({ item: comment }: { item: any }) => (
    <View className="flex-row p-4">
      <ProfileAvatar 
        size={32} 
        userId={comment.user._id}
        style={{ marginRight: 12 }}
      />
      
      <View className="flex-1">
        <View className="flex-row items-center mb-1">
          <Text
            className="font-semibold text-sm mr-2"
            style={{ color: colors.text }}
          >
            {comment.user.firstName} {comment.user.lastName}
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
        onEndReached={loadMoreComments}
        onEndReachedThreshold={0.1}
        refreshing={loading && page === 1}
        onRefresh={() => loadComments(1)}
        ListFooterComponent={() => {
          if (loading && page > 1) {
            return (
              <View className="py-4 items-center">
                <ActivityIndicator size="small" color={COLORS.primary} />
              </View>
            );
          }
          return null;
        }}
        ListEmptyComponent={() => {
          if (loading) return null;
          return (
            <View className="flex-1 items-center justify-center py-20">
              <View 
                className="w-20 h-20 rounded-full items-center justify-center mb-4"
                style={{ backgroundColor: colors.surface }}
              >
                <Ionicons name="chatbubble-outline" size={32} color={colors.textSecondary} />
              </View>
              <Text 
                className="text-lg font-semibold mb-2"
                style={{ color: colors.text }}
              >
                No comments yet
              </Text>
              <Text 
                className="text-sm text-center px-8"
                style={{ color: colors.textSecondary }}
              >
                Be the first to comment on this post!
              </Text>
            </View>
          );
        }}
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
            disabled={!comment.trim() || submitting}
            className="w-10 h-10 rounded-full items-center justify-center"
            style={{
              backgroundColor: (comment.trim() && !submitting) ? '#3B82F6' : colors.surface,
            }}
          >
            {submitting ? (
              <ActivityIndicator size="small" color={COLORS.primary} />
            ) : (
              <Ionicons 
                name="send" 
                size={18} 
                color={(comment.trim() && !submitting) ? 'white' : colors.textSecondary} 
              />
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};