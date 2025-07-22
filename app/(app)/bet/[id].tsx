import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Modal,
  ActivityIndicator,
  FlatList,
  ListRenderItem,
  Alert,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as ImagePicker from 'expo-image-picker';
import {
  ArrowLeft,
  User,
  Camera,
  Check,
  Image as ImageIcon,
  Trophy,
  Vote,
} from 'lucide-react-native';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/contexts/ToastContext';
import { BetService } from '@/services/BetService';
import { UserService } from '@/services/UserService';
import { Loading } from '@/components/ui/Loading';
import { colors } from '@/constants/theme';
import type { Bet } from '@/lib/betStore';

const ParticipantChip = ({ userId, side }: { userId: string; side: 'A' | 'B' }) => {
  const { data: user } = useQuery({
    queryKey: ['user', userId],
    queryFn: () => UserService.getUser(userId),
    enabled: !!userId,
  });

  return (
    <View style={[styles.participantChip, styles[`side${side}Chip`]]}>
      <User color={colors.text} size={16} />
      <Text style={styles.participantText}>{user?.displayName || 'Loading...'}</Text>
    </View>
  );
};

const VotingInterface = ({ bet, onVote }: { bet: Bet; onVote: (side: 'A' | 'B') => void }) => {
  const [selectedSide, setSelectedSide] = useState<'A' | 'B' | null>(null);

  return (
    <View style={styles.votingContainer}>
      <Text style={styles.votingTitle}>Cast Your Vote</Text>
      <Text style={styles.votingSubtitle}>Which side won?</Text>

      <View style={styles.votingOptions}>
        <TouchableOpacity
          style={[styles.votingOption, selectedSide === 'A' && styles.votingOptionSelected]}
          onPress={() => setSelectedSide('A')}
        >
          <View style={styles.radioButton}>
            {selectedSide === 'A' && <View style={styles.radioButtonInner} />}
          </View>
          <Text style={styles.votingOptionText}>{bet.sideA}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.votingOption, selectedSide === 'B' && styles.votingOptionSelected]}
          onPress={() => setSelectedSide('B')}
        >
          <View style={styles.radioButton}>
            {selectedSide === 'B' && <View style={styles.radioButtonInner} />}
          </View>
          <Text style={styles.votingOptionText}>{bet.sideB}</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={[styles.voteButton, !selectedSide && styles.voteButtonDisabled]}
        onPress={() => selectedSide && onVote(selectedSide)}
        disabled={!selectedSide}
      >
        <Vote color={colors.white} size={20} />
        <Text style={styles.voteButtonText}>Submit Vote</Text>
      </TouchableOpacity>
    </View>
  );
};

const BetDetailsScreen = () => {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { user } = useAuth();
  const { showSuccess, showError } = useToast();
  const queryClient = useQueryClient();
  const betId = id as string;

  const [showProofModal, setShowProofModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  // Fetch bet data
  const {
    data: bet,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['bet', betId],
    queryFn: () => BetService.getBet(betId),
    enabled: !!betId,
  });

  // Show error toast if query fails
  useEffect(() => {
    if (error) {
      showError('Failed to load bet details. Please try again.');
    }
  }, [error, showError]);

  // Accept bet mutation
  const acceptBetMutation = useMutation({
    mutationFn: ({ side }: { side: 'A' | 'B' }) => {
      if (!user) throw new Error('No user logged in');
      return BetService.acceptBet(betId, user.id, side);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bet', betId] });
      showSuccess('Successfully joined the bet!');
    },
    onError: (error: Error) => {
      showError(error?.message || 'Failed to join bet');
    },
  });

  // Submit proof mutation
  const submitProofMutation = useMutation({
    mutationFn: async (imageUri: string) => {
      if (!user) throw new Error('No user logged in');
      return BetService.submitProof(betId, user.id, imageUri);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bet', betId] });
      setShowProofModal(false);
      setSelectedImage(null);
      showSuccess('Proof submitted successfully!');
    },
    onError: (error: Error) => {
      showError(error?.message || 'Failed to submit proof');
    },
  });

  // Vote mutation
  const voteMutation = useMutation({
    mutationFn: (winningSide: 'A' | 'B') => {
      if (!user) throw new Error('No user logged in');
      return BetService.voteOnBet(betId, user.id, winningSide);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bet', betId] });
      showSuccess('Your vote has been recorded!');
    },
    onError: (error: Error) => {
      showError(error?.message || 'Failed to submit vote');
    },
  });

  const pickImage = async () => {
    try {
      // Request permission
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        showError('Please allow access to your photo library to submit proof.');
        return;
      }

      // Launch picker
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setSelectedImage(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      showError('Failed to select image');
    }
  };

  const takePhoto = async () => {
    try {
      // Request permission
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        showError('Please allow camera access to take a photo.');
        return;
      }

      // Launch camera
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setSelectedImage(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error taking photo:', error);
      showError('Failed to take photo');
    }
  };

  const handleSubmitProof = () => {
    if (selectedImage) {
      submitProofMutation.mutate(selectedImage);
    }
  };

  const handleAcceptBet = (side: 'A' | 'B') => {
    Alert.alert(
      'Join Bet',
      `Are you sure you want to join side ${side}: ${side === 'A' ? bet?.sideA : bet?.sideB}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Join',
          onPress: () => acceptBetMutation.mutate({ side }),
        },
      ]
    );
  };

  if (isLoading) {
    return (
      <View style={styles.container}>
        <Loading message="Loading bet details..." />
      </View>
    );
  }

  if (error || !bet) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <Text style={styles.errorText}>Bet not found</Text>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const isCreator = bet.creatorId === user?.id;
  const isParticipant = bet.participants.some(p => p.userId === user?.id);
  const canAcceptBet = bet.status === 'draft' && !isParticipant && bet.participants.length < 2;
  const canSubmitProof = bet.status === 'awaiting_proof' && isCreator;
  const canVote = bet.status === 'voting' && !isCreator;
  const sideAParticipants = bet.participants.filter(p => p.side === 'A');
  const sideBParticipants = bet.participants.filter(p => p.side === 'B');

  const renderParticipant: ListRenderItem<(typeof bet.participants)[0]> = ({
    item: participant,
  }) => <ParticipantChip userId={participant.userId} side={participant.side} />;

  return (
    <View style={styles.container}>
      <ScrollView>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.headerBackButton}>
            <ArrowLeft color={colors.text} size={24} />
          </TouchableOpacity>
          <Text style={styles.title} numberOfLines={2}>
            {bet.title}
          </Text>
          <View style={styles.statusBadge}>
            <Text style={styles.statusText}>{bet.status}</Text>
          </View>
        </View>

        {/* Description */}
        <View style={styles.section}>
          <Text style={styles.description}>{bet.description}</Text>
        </View>

        {/* Bet Info */}
        <View style={styles.section}>
          <View style={styles.infoGrid}>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Stake</Text>
              <Text style={styles.infoValue}>${bet.stake}</Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Event Date</Text>
              <Text style={styles.infoValue}>{new Date(bet.eventDate).toLocaleDateString()}</Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Proof Type</Text>
              <Text style={styles.infoValue}>{bet.proofType}</Text>
            </View>
          </View>
        </View>

        {/* Participants */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Participants</Text>
          <View style={styles.sidesContainer}>
            <View style={styles.sideContainer}>
              <Text style={styles.sideTitle} accessibilityRole="header">
                {bet.sideA}
              </Text>
              <View style={styles.participantsGrid}>
                {sideAParticipants.length === 0 ? (
                  <Text style={styles.emptySlot}>No participants</Text>
                ) : (
                  <FlatList
                    data={sideAParticipants}
                    renderItem={renderParticipant}
                    keyExtractor={item => item.userId}
                    scrollEnabled={false}
                    accessibilityRole="list"
                    accessibilityLabel={`Side A participants: ${sideAParticipants.length} participants`}
                  />
                )}
              </View>
              {canAcceptBet && (
                <TouchableOpacity
                  style={styles.joinButton}
                  onPress={() => handleAcceptBet('A')}
                  disabled={acceptBetMutation.isPending}
                  accessibilityRole="button"
                  accessibilityLabel={`Join ${bet.sideA}`}
                  accessibilityState={{ disabled: acceptBetMutation.isPending }}
                >
                  <Text style={styles.joinButtonText}>Join Side A</Text>
                </TouchableOpacity>
              )}
            </View>

            <View style={styles.vsContainer}>
              <Text style={styles.vsText}>VS</Text>
            </View>

            <View style={styles.sideContainer}>
              <Text style={styles.sideTitle} accessibilityRole="header">
                {bet.sideB}
              </Text>
              <View style={styles.participantsGrid}>
                {sideBParticipants.length === 0 ? (
                  <Text style={styles.emptySlot}>No participants</Text>
                ) : (
                  <FlatList
                    data={sideBParticipants}
                    renderItem={renderParticipant}
                    keyExtractor={item => item.userId}
                    scrollEnabled={false}
                    accessibilityRole="list"
                    accessibilityLabel={`Side B participants: ${sideBParticipants.length} participants`}
                  />
                )}
              </View>
              {canAcceptBet && (
                <TouchableOpacity
                  style={styles.joinButton}
                  onPress={() => handleAcceptBet('B')}
                  disabled={acceptBetMutation.isPending}
                  accessibilityRole="button"
                  accessibilityLabel={`Join ${bet.sideB}`}
                  accessibilityState={{ disabled: acceptBetMutation.isPending }}
                >
                  <Text style={styles.joinButtonText}>Join Side B</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>

        {/* Proof Submission */}
        {canSubmitProof && (
          <View style={styles.section}>
            <View style={styles.actionContainer}>
              <View style={styles.actionHeader}>
                <Camera color={colors.primary} size={24} />
                <Text style={styles.actionTitle}>Submit Proof</Text>
              </View>
              <Text style={styles.actionDescription}>
                The event has concluded. Please submit proof of the outcome.
              </Text>
              <TouchableOpacity style={styles.actionButton} onPress={() => setShowProofModal(true)}>
                <ImageIcon color={colors.white} size={20} />
                <Text style={styles.actionButtonText}>Add Photo Proof</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Voting */}
        {canVote && (
          <View style={styles.section}>
            <VotingInterface bet={bet} onVote={side => voteMutation.mutate(side)} />
          </View>
        )}

        {/* Winner Display */}
        {bet.status === 'resolved' && bet.winnerSide && (
          <View style={styles.section}>
            <View style={styles.winnerContainer}>
              <Trophy color={colors.warning} size={32} />
              <Text style={styles.winnerTitle}>Winner</Text>
              <Text style={styles.winnerText}>
                {bet.winnerSide === 'A' ? bet.sideA : bet.sideB}
              </Text>
            </View>
          </View>
        )}
      </ScrollView>

      {/* Proof Submission Modal */}
      <Modal
        visible={showProofModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowProofModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowProofModal(false)}>
              <Text style={styles.modalCancelText}>Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Submit Proof</Text>
            <View style={styles.modalSpacer} />
          </View>

          <View style={styles.modalContent}>
            {selectedImage ? (
              <View style={styles.imagePreview}>
                <Image source={{ uri: selectedImage }} style={styles.previewImage} />
                <TouchableOpacity
                  style={styles.changeImageButton}
                  onPress={() => setSelectedImage(null)}
                >
                  <Text style={styles.changeImageText}>Change Image</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.imagePickerContainer}>
                <Text style={styles.imagePickerTitle}>Add photo evidence</Text>
                <Text style={styles.imagePickerDescription}>
                  Upload a photo that proves the outcome of this bet
                </Text>

                <View style={styles.imagePickerButtons}>
                  <TouchableOpacity style={styles.imagePickerButton} onPress={takePhoto}>
                    <Camera color={colors.primary} size={32} />
                    <Text style={styles.imagePickerButtonText}>Take Photo</Text>
                  </TouchableOpacity>

                  <TouchableOpacity style={styles.imagePickerButton} onPress={pickImage}>
                    <ImageIcon color={colors.primary} size={32} />
                    <Text style={styles.imagePickerButtonText}>Choose from Library</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {selectedImage && (
              <TouchableOpacity
                style={styles.submitProofButton}
                onPress={handleSubmitProof}
                disabled={submitProofMutation.isPending}
              >
                {submitProofMutation.isPending ? (
                  <ActivityIndicator color={colors.white} />
                ) : (
                  <>
                    <Check color={colors.white} size={20} />
                    <Text style={styles.submitProofButtonText}>Submit Proof</Text>
                  </>
                )}
              </TouchableOpacity>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default BetDetailsScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: colors.textSecondary,
    fontSize: 16,
    marginTop: 16,
  },
  errorText: {
    color: colors.error,
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  backButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  backButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    gap: 12,
  },
  headerBackButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.backgroundTertiary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    flex: 1,
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
    lineHeight: 32,
  },
  statusBadge: {
    backgroundColor: colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  statusText: {
    color: colors.white,
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  description: {
    fontSize: 16,
    color: colors.textSecondary,
    lineHeight: 24,
  },
  infoGrid: {
    flexDirection: 'row',
    backgroundColor: colors.backgroundSecondary,
    borderRadius: 12,
    padding: 16,
    gap: 16,
  },
  infoItem: {
    flex: 1,
    alignItems: 'center',
  },
  infoLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 16,
  },
  sidesContainer: {
    flexDirection: 'row',
    backgroundColor: colors.backgroundSecondary,
    borderRadius: 12,
    padding: 16,
    gap: 12,
  },
  sideContainer: {
    flex: 1,
    alignItems: 'center',
    gap: 12,
  },
  sideTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    textAlign: 'center',
  },
  participantsGrid: {
    gap: 8,
    minHeight: 40,
    justifyContent: 'center',
  },
  participantChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.backgroundTertiary,
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 12,
    gap: 8,
  },
  sideAChip: {
    borderColor: colors.success,
    borderWidth: 1,
  },
  sideBChip: {
    borderColor: colors.info,
    borderWidth: 1,
  },
  participantText: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '500',
  },
  emptySlot: {
    color: colors.textSecondary,
    fontSize: 14,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  joinButton: {
    backgroundColor: colors.primary,
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 16,
    marginTop: 8,
  },
  joinButtonText: {
    color: colors.white,
    fontSize: 14,
    fontWeight: '600',
  },
  vsContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
  vsText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.textSecondary,
    backgroundColor: colors.background,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  actionContainer: {
    backgroundColor: colors.backgroundSecondary,
    borderRadius: 12,
    padding: 20,
  },
  actionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 8,
  },
  actionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
  },
  actionDescription: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 16,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    borderRadius: 10,
    paddingVertical: 14,
    gap: 8,
  },
  actionButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
  votingContainer: {
    backgroundColor: colors.backgroundSecondary,
    borderRadius: 12,
    padding: 20,
  },
  votingTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 4,
  },
  votingSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 20,
  },
  votingOptions: {
    gap: 12,
    marginBottom: 20,
  },
  votingOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.backgroundTertiary,
    borderRadius: 10,
    padding: 16,
    gap: 12,
  },
  votingOptionSelected: {
    borderColor: colors.primary,
    borderWidth: 2,
  },
  radioButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: colors.textSecondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioButtonInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.primary,
  },
  votingOptionText: {
    flex: 1,
    fontSize: 16,
    color: colors.text,
    fontWeight: '500',
  },
  voteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    borderRadius: 10,
    paddingVertical: 14,
    gap: 8,
  },
  voteButtonDisabled: {
    opacity: 0.5,
  },
  voteButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
  winnerContainer: {
    backgroundColor: colors.backgroundSecondary,
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    gap: 8,
  },
  winnerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
  },
  winnerText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.warning,
  },
  // Modal styles
  modalContainer: {
    flex: 1,
    backgroundColor: colors.background,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.backgroundTertiary,
  },
  modalCancelText: {
    color: colors.primary,
    fontSize: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
  },
  modalSpacer: {
    width: 60,
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  imagePreview: {
    alignItems: 'center',
    gap: 20,
  },
  previewImage: {
    width: '100%',
    height: 300,
    borderRadius: 12,
  },
  changeImageButton: {
    backgroundColor: colors.backgroundSecondary,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  changeImageText: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: '600',
  },
  imagePickerContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  imagePickerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 8,
  },
  imagePickerDescription: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 40,
  },
  imagePickerButtons: {
    flexDirection: 'row',
    gap: 20,
  },
  imagePickerButton: {
    alignItems: 'center',
    backgroundColor: colors.backgroundSecondary,
    borderRadius: 12,
    padding: 20,
    gap: 12,
    minWidth: 120,
  },
  imagePickerButtonText: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '600',
  },
  submitProofButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.success,
    borderRadius: 10,
    paddingVertical: 16,
    marginTop: 20,
    gap: 8,
  },
  submitProofButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
});
