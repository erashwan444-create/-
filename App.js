import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  FlatList,
  SafeAreaView,
  Alert,
  Linking,
  ActivityIndicator,
  StatusBar,
} from 'react-native';
import { createClient } from '@supabase/supabase-js';

// بيانات مشروع Supabase الخاص بك
const SUPABASE_URL = 'https://lbzkcvptikvjblfzmlqo.supabase.co';
const SUPABASE_ANON_KEY =
  'sb_publishable_y1WikQnE-3gDTG8wGz0SXQ_vSfsQwiU';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export default function App() {
  const [search, setSearch] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [name, setName] = useState('');
  const [owner, setOwner] = useState('');
  const [phone, setPhone] = useState('');
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  // جلب البيانات عند فتح التطبيق
  useEffect(() => {
    fetchItems();
  }, []);

  async function fetchItems() {
    setLoading(true);
    const { data, error } = await supabase
      .from('items')
      .select('*')
      .order('id', { ascending: false });

    if (error) {
      Alert.alert('خطأ', 'حدث خطأ أثناء جلب البيانات');
    } else {
      setItems(data || []);
    }
    setLoading(false);
  }

  // إضافة عنصر جديد
  async function addItem() {
    if (!name.trim() || !owner.trim()) {
      Alert.alert('تنبيه', 'يرجى كتابة اسم الحاجة واسم صاحبها');
      return;
    }

    setLoading(true);
    const { error } = await supabase
      .from('items')
      .insert([{ name: name.trim(), owner: owner.trim(), phone: phone.trim() }]);

    if (error) {
      Alert.alert('خطأ', error.message);
    } else {
      Alert.alert('نجاح 🎉', 'تمت إضافة الحاجة بنجاح!');
      setName('');
      setOwner('');
      setPhone('');
      setShowAdd(false);
      fetchItems();
    }
    setLoading(false);
  }

  const filteredItems = items.filter((item) =>
    item.name ? item.name.toLowerCase().includes(search.toLowerCase()) : false
  );

  // شاشة إضافة عنصر
  if (showAdd) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" />
        <View style={styles.headerBox}>
          <Text style={styles.title}>إضافة حاجة جديدة ➕</Text>
          <Text style={styles.subtitle}>أدخل تفاصيل الحاجة لترتيب التواصل معك</Text>
        </View>

        <View style={styles.form}>
          <Text style={styles.label}>اسم الحاجة</Text>
          <TextInput
            style={styles.input}
            placeholder="مثال: دريل، سلم، كتاب..."
            value={name}
            onChangeText={setName}
          />

          <Text style={styles.label}>اسم صاحب الحاجة</Text>
          <TextInput
            style={styles.input}
            placeholder="اسمك أو اسم صاحب الحاجة"
            value={owner}
            onChangeText={setOwner}
          />

          <Text style={styles.label}>رقم الهاتف للتواصل</Text>
          <TextInput
            style={styles.input}
            placeholder="01xxxxxxxxx"
            keyboardType="phone-pad"
            value={phone}
            onChangeText={setPhone}
          />

          <TouchableOpacity style={styles.primaryButton} onPress={addItem}>
            <Text style={styles.primaryButtonText}>حفظ وإضافة</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={() => setShowAdd(false)}>
            <Text style={styles.secondaryButtonText}>رجوع للرئيسية</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // الشاشة الرئيسية
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.headerBox}>
        <Text style={styles.title}>مين عنده؟ 🔍</Text>
        <Text style={styles.subtitle}>ابحث عن الأشياء التي تحتاجها لدى من حولك</Text>
      </View>

      <TextInput
        style={styles.searchInput}
        placeholder="🔍 ابحث باسم الحاجة..."
        value={search}
        onChangeText={setSearch}
      />

      <TouchableOpacity
        style={styles.openAddButton}
        onPress={() => setShowAdd(true)}>
        <Text style={styles.openAddText}>+ ضيف حاجة عندك</Text>
      </TouchableOpacity>

      <Text style={styles.sectionTitle}>الموجود حاليًا ({filteredItems.length})</Text>

      {loading ? (
        <ActivityIndicator size="large" color="#2563eb" style={{ marginTop: 30 }} />
      ) : (
        <FlatList
          data={filteredItems}
          keyExtractor={(item) => item.id.toString()}
          onRefresh={fetchItems}
          refreshing={loading}
          ListEmptyComponent={
            <Text style={styles.emptyText}>لا توجد نتائج مطابقة لطلبك</Text>
          }
          renderItem={({ item }) => (
            <View style={styles.card}>
              <View style={styles.cardInfo}>
                <Text style={styles.itemName}>{item.name}</Text>
                <Text style={styles.itemOwner}>👤 عند: {item.owner}</Text>
              </View>

              {item.phone ? (
                <TouchableOpacity
                  style={styles.contactButton}
                  onPress={() => Linking.openURL(`tel:${item.phone}`)}>
                  <Text style={styles.contactText}>📞 تواصل</Text>
                </TouchableOpacity>
              ) : null}
            </View>
          )}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    backgroundColor: '#f8fafc',
    paddingTop: 40,
  },
  headerBox: {
    marginBottom: 15,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#0f172a',
  },
  subtitle: {
    fontSize: 13,
    color: '#64748b',
    textAlign: 'center',
    marginTop: 4,
  },
  searchInput: {
    backgroundColor: '#ffffff',
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    textAlign: 'right',
    marginBottom: 12,
    fontSize: 15,
  },
  openAddButton: {
    backgroundColor: '#2563eb',
    padding: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 20,
  },
  openAddText: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'right',
    marginBottom: 12,
    color: '#334155',
  },
  card: {
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 12,
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#f1f5f9',
    elevation: 1,
  },
  cardInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 17,
    fontWeight: 'bold',
    textAlign: 'right',
    color: '#1e293b',
  },
  itemOwner: {
    fontSize: 13,
    color: '#64748b',
    textAlign: 'right',
    marginTop: 4,
  },
  contactButton: {
    backgroundColor: '#16a34a',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  contactText: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  form: {
    marginTop: 10,
  },
  label: {
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'right',
    color: '#475569',
    marginBottom: 6,
  },
  input: {
    backgroundColor: '#ffffff',
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    textAlign: 'right',
    marginBottom: 16,
    fontSize: 15,
  },
  primaryButton: {
    backgroundColor: '#2563eb',
    padding: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 10,
  },
  primaryButtonText: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  secondaryButton: {
    backgroundColor: '#e2e8f0',
    padding: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 10,
  },
  secondaryButtonText: {
    color: '#475569',
    fontWeight: 'bold',
  },
  emptyText: {
    textAlign: 'center',
    color: '#94a3b8',
    marginTop: 30,
    fontSize: 15,
  },
});
