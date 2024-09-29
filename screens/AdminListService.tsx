import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Modal, TextInput, SafeAreaView } from 'react-native';
import { FIRESTORE_DB } from '../firebaseConfig'; 
import { collection, getDocs, addDoc } from 'firebase/firestore';
import Icon from 'react-native-vector-icons/FontAwesome'; // Import icons

type Service = {
  id: string;
  Creator: string;
  Price: number;
  ServiceName: string;
};

const AdminListScreen = ({ navigation }: any) => {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalVisible, setModalVisible] = useState(false);
  const [creator, setCreator] = useState('');
  const [price, setPrice] = useState('');
  const [serviceName, setServiceName] = useState('');

  useEffect(() => {
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

    const unsubscribe = navigation.addListener('focus', fetchServices); 

    fetchServices();

    return unsubscribe;
  }, [navigation]);

  const renderItem = ({ item }: { item: Service }) => (
    <TouchableOpacity
      style={styles.item}
      onPress={() => navigation.navigate('AdminDetailScreen', { service: item })}
      activeOpacity={0.7}
    >
      <Text style={styles.itemName}>{item.ServiceName}</Text>
      <Text style={styles.itemPrice}>{item.Price} ₫</Text>
      <Text style={styles.itemCreator}>{item.Creator}</Text> 
    </TouchableOpacity>
  );

  const handleAddService = async () => {
    if (!creator || !price || !serviceName) {
      alert('Please fill in all the information');
      return;
    }

    const priceValue = parseInt(price);
    if (isNaN(priceValue) || priceValue <= 0) {
      alert('Service price must be a positive number');
      return;
    }

    const newService = {
      Creator: creator,
      Price: priceValue,
      ServiceName: serviceName,
    };

    try {
      const docRef = await addDoc(collection(FIRESTORE_DB, 'Service'), newService);
      setServices(prevServices => [...prevServices, { ...newService, id: docRef.id }]);
      setCreator('');
      setPrice('');
      setServiceName('');
      setModalVisible(false);
    } catch (error) {
      console.error('Error adding service:', error);
    }
  };

  if (loading) {
    return <ActivityIndicator size="large" color="#0000ff" style={styles.loadingIndicator} />;
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>ADMIN</Text>

      </View>
      <View style={styles.content}>
        <View style={styles.serviceListHeader}>
          <Text style={styles.serviceListHeaderText}>Danh sách dịch vụ</Text>
          <TouchableOpacity style={styles.addButton} onPress={() => setModalVisible(true)}>
            <Text style={styles.addButtonText}>+</Text>
          </TouchableOpacity>
        </View>

        <FlatList
          data={services} // Remove filtering
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent} // Add padding to the FlatList
        />
      </View>

      <View style={styles.bottomNav}>
        <TouchableOpacity onPress={() => navigation.navigate('Home')} style={styles.navItem}>
          <Icon name="home" size={20} color="white" />
          <Text style={styles.navText}>Home</Text>
        </TouchableOpacity>       
        <TouchableOpacity onPress={() => navigation.navigate('Customer')} style={styles.navItem}>
          <Icon name="user" size={20} color="white" />
          <Text style={styles.navText}>Customer</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate('SettingsScreen')} style={styles.navItem}>
          <Icon name="cog" size={20} color="white" />
          <Text style={styles.navText}>Setting</Text>
        </TouchableOpacity>
      </View>

      <Modal
        transparent={true}
        visible={isModalVisible}
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add New Service</Text>
            <TextInput
              style={styles.input}
              placeholder="Creator's Name"
              value={creator}
              onChangeText={setCreator}
            />
            <TextInput
              style={styles.input}
              placeholder="Service Price"
              value={price}
              onChangeText={setPrice}
              keyboardType="numeric"
            />
            <TextInput
              style={styles.input}
              placeholder="Service Name"
              value={serviceName}
              onChangeText={setServiceName}
            />
            <TouchableOpacity style={styles.submitButton} onPress={handleAddService}>
              <Text style={styles.submitButtonText}>Add Service</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.closeButton} onPress={() => setModalVisible(false)}>
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F7F7',
  },
  header: {
    backgroundColor: '#F8C0C8',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15, // Increased vertical padding
  },
  headerText: {
    fontSize: 20, // Increased font size
    fontWeight: 'bold',
    color: 'white',
  },
  logo: {
    fontSize: 24, // Increased font size
    fontWeight: 'bold',
    color: '#E60026',
  },
  content: {
    flex: 1,
    padding: 10,
    backgroundColor: '#FFFFFF',
  },
  serviceListHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  serviceListHeaderText: {
    fontSize: 18, // Increased font size
    fontWeight: 'bold',
    color: '#333333',
  },
  addButton: {
    backgroundColor: '#E60026',
    padding: 8,
    borderRadius: 25,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
  },
  item: {
    padding: 12, // Increased padding for item
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
  },
  itemName: {
    fontSize: 16, // Increased font size
    fontWeight: 'bold',
    color: '#333333',
  },
  itemPrice: {
    fontSize: 14, // Increased font size
    color: '#666666',
  },
  itemCreator: {
    fontSize: 14, // Increased font size
    color: '#999999',
  },
  bottomNav: {
    flexDirection: 'row',
    justifyContent: 'space-around', // Use space-around for even distribution
    alignItems: 'center',
    padding: 10,
    backgroundColor: '#F8C0C8',
  },
  navItem: {
    alignItems: 'center',
  },
  navText: {
    fontSize: 12, // Reduced font size for better spacing
    color: 'white',
  },
  loadingIndicator: {
    flex: 1,
    justifyContent: 'center',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)', // Semi-transparent background
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 20,
    marginHorizontal: 30,
    borderRadius: 8,
    elevation: 5, // Add shadow effect for Android
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  input: {
    borderColor: '#E5E5E5',
    borderWidth: 1,
    borderRadius: 4,
    padding: 10,
    marginBottom: 15,
  },
  submitButton: {
    backgroundColor: '#E60026',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
  },
  submitButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  closeButton: {
    alignItems: 'center',
    marginTop: 10,
  },
  closeButtonText: {
    color: '#E60026',
    fontWeight: 'bold',
  },
  listContent: {
    paddingBottom: 20, // Add bottom padding to the FlatList
  },
});

export default AdminListScreen;
