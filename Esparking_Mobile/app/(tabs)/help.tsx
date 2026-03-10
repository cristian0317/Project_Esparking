import React, { useState } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, Linking, Alert, LayoutAnimation, Platform, UIManager } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';


const faqData = [
  {
    key: '1',
    title: '¿Cómo usar la app?',
    content: 'Navega por las pestañas "Buscar" y "Mapa" para encontrar estacionamientos disponibles cerca de ti.',
    icon: 'navigate-circle-outline',
  },
  {
    key: '2',
    title: 'Regulaciones de Estacionamiento',
    content: 'Recuerda siempre verificar las señales de tráfico locales y las regulaciones de estacionamiento. Esparking Movil te ayuda a encontrar lugares, pero la responsabilidad final es tuya.',
    icon: 'alert-circle-outline',
  },
  {
    key: '3',
    title: '¿Cómo reportar un problema?',
    content: 'Si encuentras un error en la aplicación o tienes alguna sugerencia, no dudes en contactarnos. Tu feedback es muy valioso para nosotros.',
    icon: 'build-outline',
  },
];

const AccordionItem = ({ item, expanded, setExpanded }) => {
  const isExpanded = expanded === item.key;

  const toggleExpand = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpanded(isExpanded ? null : item.key);
  };

  return (
    <View style={styles.accordionItem}>
      <TouchableOpacity style={styles.accordionHeader} onPress={toggleExpand} activeOpacity={0.8}>
        <Ionicons name={item.icon} size={24} color="#007AFF" />
        <Text style={styles.accordionTitle}>{item.title}</Text>
        <Ionicons name={isExpanded ? 'chevron-up-outline' : 'chevron-down-outline'} size={24} color="#8e8e93" />
      </TouchableOpacity>
      {isExpanded && (
        <View style={styles.accordionContent}>
          <Text style={styles.paragraph}>{item.content}</Text>
        </View>
      )}
    </View>
  );
};


export default function HelpScreen() {
  const [expanded, setExpanded] = useState<string | null>(null);

  const handleEmailPress = async () => {
    const email = 'soporte@esparkingmovil.com';
    const url = `mailto:${email}`;

    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      } else {
        Alert.alert('Error', 'No se pudo abrir el cliente de correo electrónico.');
      }
    } catch (error) {
      console.error('Failed to open email client', error);
      Alert.alert('Error', 'Ocurrió un error al intentar abrir el cliente de correo electrónico.');
    }
  };

  const handlePhonePress = async () => {
    const phoneNumber = '+525512345678'; // Placeholder Mexican number
    const url = `tel:${phoneNumber}`;

    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      } else {
        Alert.alert('Error', 'No se pudo abrir la aplicación de teléfono.');
      }
    } catch (error) {
      console.error('Failed to open phone app', error);
      Alert.alert('Error', 'Ocurrió un error al intentar abrir la aplicación de teléfono.');
    }
  };


  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Centro de Ayuda</Text>
        <Text style={styles.introParagraph}>
          Bienvenido. Aquí encontrarás respuestas a las preguntas más comunes. Si no encuentras lo que buscas, no dudes en contactarnos.
        </Text>

        {faqData.map(item => (
          <AccordionItem
            key={item.key}
            item={item}
            expanded={expanded}
            setExpanded={setExpanded}
          />
        ))}

        <View style={styles.contactSection}>
          <Text style={styles.subtitle}>¿Necesitas más ayuda?</Text>
          <View style={styles.contactButtonsContainer}>
            <TouchableOpacity style={styles.contactButton} onPress={handleEmailPress}>
              <Ionicons name="mail-outline" size={20} color="#fff" />
              <Text style={styles.contactButtonText}>Correo</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.contactButton} onPress={handlePhonePress}>
              <Ionicons name="call-outline" size={20} color="#fff" />
              <Text style={styles.contactButtonText}>Llamar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f0f0f7',
  },
  container: {
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1c1c1e',
    marginBottom: 10,
    textAlign: 'center',
  },
  introParagraph: {
    fontSize: 16,
    color: '#6c6c6e',
    textAlign: 'center',
    marginBottom: 30,
  },
  accordionItem: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 15,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 3,
  },
  accordionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 18,
    paddingHorizontal: 15,
  },
  accordionTitle: {
    flex: 1,
    fontSize: 17,
    fontWeight: '600',
    color: '#1c1c1e',
    marginLeft: 15,
  },
  accordionContent: {
    paddingHorizontal: 15,
    paddingBottom: 20,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f7',
  },
  paragraph: {
    fontSize: 15,
    color: '#6c6c6e',
    lineHeight: 22,
    marginTop: 10,
  },
  contactSection: {
    marginTop: 30,
    alignItems: 'center',
  },
  subtitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1c1c1e',
    marginBottom: 15,
  },
  contactButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    width: '100%',
  },
  contactButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 25,
    marginHorizontal: 10, // Added margin for spacing between buttons
  },
  contactButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 10,
  },
});
