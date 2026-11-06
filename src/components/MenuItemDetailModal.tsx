import React, { useState } from 'react';
import {
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { MenuItem } from '@/constants/canteenData';
import { useCanteen } from '@/context/CanteenContext';

interface MenuItemDetailModalProps {
  item: MenuItem | null;
  visible: boolean;
  onClose: () => void;
}

const DETAIL_NOTE_CHIPS = ['Pedas Sedang', 'Tidak Pedas', 'Kuah Dipisah', 'Sedikit Es', 'Bungkus Rapi'];

export const MenuItemDetailModal: React.FC<MenuItemDetailModalProps> = ({
  item,
  visible,
  onClose,
}) => {
  const { addToCart, activeTheme } = useCanteen();
  const [qty, setQty] = useState<number>(1);
  const [note, setNote] = useState<string>('');

  if (!item) return null;

  const handleAdd = () => {
    for (let i = 0; i < qty; i++) {
      addToCart(item, note.trim() || undefined);
    }
    setQty(1);
    setNote('');
    onClose();
  };

  const isOutOfStock = item.stock === 0;
  const totalPrice = item.price * qty;

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.card}>
          {/* Header Image */}
          <View style={styles.imageBox}>
            <Image
              source={typeof item.image === 'string' ? { uri: item.image } : item.image}
              style={styles.image}
              resizeMode="cover"
            />
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Text style={styles.closeBtnText}>✕</Text>
            </TouchableOpacity>

            <View style={[styles.ratingBadge, { backgroundColor: 'rgba(15, 23, 42, 0.85)' }]}>
              <Text style={styles.ratingText}>⭐ {item.rating.toFixed(1)} ({item.soldCount} terjual)</Text>
            </View>

            <View
              style={[
                styles.stockBadge,
                {
                  backgroundColor:
                    item.stock === 0
                      ? '#ef4444'
                      : item.stock <= 5
                      ? '#f59e0b'
                      : activeTheme.primary,
                },
              ]}>
              <Text style={styles.stockText}>
                {item.stock === 0 ? 'Habis' : `Tersedia ${item.stock} porsi`}
              </Text>
            </View>
          </View>

          <ScrollView style={styles.contentScroll} showsVerticalScrollIndicator={false}>
            {/* Stan & Category Row */}
            <View style={styles.stanRow}>
              <View style={[styles.stanPill, { backgroundColor: activeTheme.primarySoft }]}>
                <Text style={[styles.stanText, { color: activeTheme.primaryDark }]}>
                  🏪 {item.stan}
                </Text>
              </View>
              <View style={styles.prepPill}>
                <Text style={styles.prepText}>⏱️ {item.prepTime}</Text>
              </View>
            </View>

            {/* Title & Price */}
            <Text style={styles.title}>{item.name}</Text>
            <Text style={[styles.price, { color: activeTheme.primary }]}>
              Rp {item.price.toLocaleString('id-ID')}
            </Text>

            {/* Description */}
            <Text style={styles.description}>{item.description}</Text>

            {/* Dietary & Quality Badges */}
            <View style={styles.badgesRow}>
              <View style={styles.dietaryBadge}>
                <Text style={styles.dietaryText}>✓ 100% Halal</Text>
              </View>
              <View style={styles.dietaryBadge}>
                <Text style={styles.dietaryText}>✨ Higienis & Segar</Text>
              </View>
              <View style={styles.dietaryBadge}>
                <Text style={styles.dietaryText}>⚡ Masak Cepat</Text>
              </View>
            </View>

            {/* Note Section */}
            <View style={styles.notesBox}>
              <Text style={styles.notesTitle}>📝 Catatan Khusus untuk Stan / Dapur:</Text>
              <View style={styles.chipsRow}>
                {DETAIL_NOTE_CHIPS.map((chip) => (
                  <TouchableOpacity
                    key={chip}
                    onPress={() => {
                      const next = note ? `${note}, ${chip}` : chip;
                      setNote(next);
                    }}
                    style={styles.chipPill}>
                    <Text style={styles.chipText}>+{chip}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <TextInput
                style={styles.input}
                placeholder="Tulis catatan (misal: jangan terlalu pedas, bumbu dipisah)..."
                placeholderTextColor="#94a3b8"
                value={note}
                onChangeText={setNote}
              />
            </View>

            <View style={{ height: 16 }} />
          </ScrollView>

          {/* Footer Controls */}
          <View style={styles.footer}>
            <View style={styles.qtyBox}>
              <TouchableOpacity
                disabled={qty <= 1}
                onPress={() => setQty((prev) => Math.max(1, prev - 1))}
                style={[styles.qtyBtn, qty <= 1 && styles.qtyBtnDisabled]}>
                <Text style={styles.qtyBtnText}>-</Text>
              </TouchableOpacity>
              <Text style={styles.qtyVal}>{qty}</Text>
              <TouchableOpacity
                disabled={qty >= item.stock}
                onPress={() => setQty((prev) => Math.min(item.stock, prev + 1))}
                style={[styles.qtyBtn, qty >= item.stock && styles.qtyBtnDisabled]}>
                <Text style={styles.qtyBtnText}>+</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              disabled={isOutOfStock}
              onPress={handleAdd}
              style={[
                styles.addCartBtn,
                { backgroundColor: activeTheme.primary },
                isOutOfStock && styles.addCartBtnDisabled,
              ]}>
              <Text style={styles.addCartBtnText}>
                {isOutOfStock
                  ? 'Stok Habis'
                  : `+ Tambah ke Keranjang • Rp ${totalPrice.toLocaleString('id-ID')}`}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.7)',
    justifyContent: 'flex-end',
  },
  card: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    maxHeight: '92%',
    overflow: 'hidden',
  },
  imageBox: {
    width: '100%',
    height: 220,
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  closeBtn: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeBtnText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  ratingBadge: {
    position: 'absolute',
    bottom: 14,
    left: 14,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  ratingText: {
    color: '#fbbf24',
    fontSize: 12,
    fontWeight: '800',
  },
  stockBadge: {
    position: 'absolute',
    bottom: 14,
    right: 14,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  stockText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '800',
  },
  contentScroll: {
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  stanRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  stanPill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  stanText: {
    fontSize: 11,
    fontWeight: '800',
  },
  prepPill: {
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
  },
  prepText: {
    fontSize: 11,
    color: '#64748b',
    fontWeight: '700',
  },
  title: {
    fontSize: 20,
    fontWeight: '900',
    color: '#0f172a',
    marginBottom: 4,
  },
  price: {
    fontSize: 20,
    fontWeight: '900',
    marginBottom: 10,
  },
  description: {
    fontSize: 13,
    color: '#475569',
    lineHeight: 20,
    marginBottom: 14,
  },
  badgesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  dietaryBadge: {
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
  },
  dietaryText: {
    fontSize: 11,
    color: '#334155',
    fontWeight: '700',
  },
  notesBox: {
    backgroundColor: '#f8fafc',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  notesTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#1e293b',
    marginBottom: 8,
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 10,
  },
  chipPill: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#cbd5e1',
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 8,
  },
  chipText: {
    fontSize: 11,
    color: '#334155',
    fontWeight: '600',
  },
  input: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 12,
    color: '#0f172a',
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
    backgroundColor: '#ffffff',
    gap: 12,
  },
  qtyBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f1f5f9',
    borderRadius: 14,
    padding: 4,
  },
  qtyBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  qtyBtnDisabled: {
    opacity: 0.4,
  },
  qtyBtnText: {
    fontSize: 18,
    fontWeight: '900',
    color: '#0f172a',
  },
  qtyVal: {
    fontSize: 15,
    fontWeight: '900',
    color: '#0f172a',
    paddingHorizontal: 12,
  },
  addCartBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  addCartBtnDisabled: {
    backgroundColor: '#94a3b8',
    shadowOpacity: 0,
    elevation: 0,
  },
  addCartBtnText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '800',
  },
});
