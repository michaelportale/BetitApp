import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { betStore } from '../../src/lib/betStore';
import { ArrowLeft } from 'lucide-react-native';

const CreateBetScreen = () => {
  const router = useRouter();
  const { groupId } = useLocalSearchParams();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [sideA, setSideA] = useState('');
  const [sideB, setSideB] = useState('');
  const [stake, setStake] = useState('');

  const handleCreateBet = () => {
    if (!title.trim() || !sideA.trim() || !sideB.trim() || !stake.trim()) {
      Alert.alert('Error', 'Please fill out all fields.');
      return;
    }

    const user = betStore.getUser('alice@test.com'); // Assuming Alice is logged in
    if (user && groupId) {
      betStore.createBet({
        title,
        description,
        sideA,
        sideB,
        stake: parseFloat(stake),
        eventDate: new Date(), // Using current date for simplicity
        proofType: 'vote',
        groupId: groupId as string,
        creatorId: user.id,
      });
      Alert.alert('Success', 'Bet created successfully!');
      router.back();
    } else {
      Alert.alert('Error', 'Could not create bet. User or Group ID missing.');
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft color="white" size={24} />
        </TouchableOpacity>
        <Text style={styles.title}>Create New Bet</Text>
      </View>

      <View style={styles.form}>
        <Text style={styles.label}>Title</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g., Lakers vs. Warriors"
          value={title}
          onChangeText={setTitle}
        />

        <Text style={styles.label}>Description</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Describe the terms of the bet"
          value={description}
          onChangeText={setDescription}
          multiline
        />

        <Text style={styles.label}>The Two Sides</Text>
        <TextInput
          style={styles.input}
          placeholder="Side A (e.g., Lakers win)"
          value={sideA}
          onChangeText={setSideA}
        />
        <TextInput
          style={styles.input}
          placeholder="Side B (e.g., Warriors win)"
          value={sideB}
          onChangeText={setSideB}
        />

        <Text style={styles.label}>Stake</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g., 25"
          value={stake}
          onChangeText={setStake}
          keyboardType="numeric"
        />

        <TouchableOpacity style={styles.button} onPress={handleCreateBet}>
          <Text style={styles.buttonText}>Create Bet</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

export default CreateBetScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1c1c1e',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 24,
  },
  backButton: {
    marginRight: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  form: {
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  label: {
    fontSize: 16,
    color: 'white',
    marginBottom: 8,
  },
  input: {
    width: '100%',
    height: 50,
    backgroundColor: '#2c2c2e',
    borderRadius: 8,
    paddingHorizontal: 16,
    color: 'white',
    fontSize: 16,
    marginBottom: 16,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
    paddingTop: 16,
  },
  button: {
    height: 50,
    backgroundColor: '#0e7490',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
