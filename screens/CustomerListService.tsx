import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, SafeAreaView } from 'react-native';
import { FIRESTORE_DB } from '../firebaseConfig'; // Firebase configuration
import { collection, getDocs } from 'firebase/firestore'; // Firebase Firestore SDK
import Icon from 'react-native-vector-icons/MaterialIcons'; // Importing MaterialIcons

// Define the Service data type
type Service = {
  id: string;
  Creator: string;
  Price: number;
  ServiceName: string;
};

const CustomerListService = ({ navigation }: any) => {
  const [services, setServices] = useState<Service[]>([]); // Services data
  const [loading, setLoading] = useState(true); // Data loading state

  useEffect(() => {
    // Function to fetch data from Firestore
    const fetchServices = async () => {
      try {
        const querySnapshot = await getDocs(collection(FIRESTORE_DB, 'Service'));
        const serviceList: Service[] = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data() as Omit<Service, 'id'>,
        }));
        setServices(serviceList);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching service list:', error);
        setLoading(false);
      }
    };

    fetchServices();
  }, []);

  // Function to render each item in the service list
  const renderItem = ({ item }: { item: Service }) => (
    <TouchableOpacity
      style={styles.item}
      onPress={() => navigation.navigate('DetailScreen', { service: item })}
      activeOpacity={0.7}
    >
      <Text style={styles.itemName}>{item.ServiceName}</Text>
      <Text style={styles.itemPrice}>{item.Price} ₫</Text>
    </TouchableOpacity>
  );

  // Show loading indicator while data is loading
  if (loading) {
    return <ActivityIndicator size="large" color="#D5006D" style={{ flex: 1, justifyContent: 'center' }} />;
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.logo}>KAMI SPA</Text>
      </View>
      <View style={styles.content}>
        <Text style={styles.serviceListHeaderText}>Service List</Text>
        <FlatList
          data={services}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
        />
      </View>
      <View style={styles.bottomNav}>
        <TouchableOpacity onPress={() => navigation.navigate('HomeScreen')} style={styles.navItem}>
          <Icon name="home" size={24} color="white" />
          <Text style={styles.navText}>Home</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate('SettingsScreen')} style={styles.navItem}>
          <Icon name="settings" size={24} color="white" />
          <Text style={styles.navText}>Setting</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

// Define styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFE4E1', // Light pink background for the entire container
  },
  header: {
    backgroundColor: '#D5006D', // Darker pink for header
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
    paddingTop: 30, // Add padding to account for the notch
  },
  headerText: {
    fontSize: 20, // Slightly larger font for better readability
    fontWeight: 'bold',
    color: 'white',
  },
  logo: {
    fontSize: 26, // Slightly larger logo for better visibility
    fontWeight: 'bold',
    color: '#fff', // White color for logo
  },
  content: {
    flex: 1,
    padding: 10,
    backgroundColor: '#FFF', // Keep content background white for contrast
  },
  serviceListHeaderText: {
    fontSize: 20, // Slightly larger font for better readability
    fontWeight: 'bold',
    color: '#D5006D', // Pink color for service list header
    marginBottom: 10,
  },
  item: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#E5B0B0', // Light pink for item border
  },
  itemName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#D5006D', // Pink color for service names
  },
  itemPrice: {
    fontSize: 14,
    color: '#666666',
  },
  bottomNav: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
    backgroundColor: '#D5006D', // Pink background for bottom nav
  },
  navItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  navText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
    marginLeft: 5, // Space between icon and text
  },
});

export default CustomerListService;
