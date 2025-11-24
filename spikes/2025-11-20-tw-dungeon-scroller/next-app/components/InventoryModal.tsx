'use client';

import { COLORS } from '@/lib/ui/colors';

// Equipment slot types
export type EquipmentSlot = 'head' | 'chest' | 'legs' | 'feet' | 'mainHand' | 'offHand';

// Item interface (placeholder for now)
export interface Item {
  id: string;
  name: string;
  slot: EquipmentSlot;
  icon?: string; // Placeholder for sprite/icon
}

// Equipment state
export interface Equipment {
  head: Item | null;
  chest: Item | null;
  legs: Item | null;
  feet: Item | null;
  mainHand: Item | null;
  offHand: Item | null;
}

interface InventoryModalProps {
  onClose: () => void;
  equipment: Equipment;
  inventory: Item[];
  onEquip?: (item: Item) => void;
  onUnequip?: (slot: EquipmentSlot) => void;
}

// Slot labels in German
const SLOT_LABELS: Record<EquipmentSlot, string> = {
  head: 'Helm',
  chest: 'Brustplatte',
  legs: 'Hose',
  feet: 'Schuhe',
  mainHand: 'Schwert',
  offHand: 'Schild',
};

// Equipment slot component
function EquipmentSlotBox({
  slot,
  item,
  onClick,
  style,
}: {
  slot: EquipmentSlot;
  item: Item | null;
  onClick?: () => void;
  style?: React.CSSProperties;
}) {
  return (
    <div
      onClick={onClick}
      style={{
        width: '60px',
        height: '60px',
        backgroundColor: item ? COLORS.background.input : COLORS.background.darker,
        border: `2px solid ${item ? COLORS.gold : COLORS.border.input}`,
        borderRadius: '8px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        cursor: onClick ? 'pointer' : 'default',
        transition: 'all 0.2s ease',
        ...style,
      }}
      title={SLOT_LABELS[slot]}
    >
      {item ? (
        <span style={{ color: COLORS.text.primary, fontSize: '10px', textAlign: 'center' }}>
          {item.name}
        </span>
      ) : (
        <span style={{ color: COLORS.text.muted, fontSize: '9px', textAlign: 'center' }}>
          {SLOT_LABELS[slot]}
        </span>
      )}
    </div>
  );
}

// Inventory slot component
function InventorySlotBox({
  item,
  onClick,
}: {
  item: Item | null;
  onClick?: () => void;
}) {
  return (
    <div
      onClick={onClick}
      style={{
        width: '50px',
        height: '50px',
        backgroundColor: item ? COLORS.background.input : COLORS.background.darker,
        border: `2px solid ${item ? COLORS.border.light : COLORS.border.input}`,
        borderRadius: '6px',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        cursor: item && onClick ? 'pointer' : 'default',
        transition: 'all 0.2s ease',
      }}
      title={item?.name}
    >
      {item ? (
        <span style={{ color: COLORS.text.primary, fontSize: '9px', textAlign: 'center' }}>
          {item.name}
        </span>
      ) : null}
    </div>
  );
}

export default function InventoryModal({
  onClose,
  equipment,
  inventory,
  onEquip,
  onUnequip,
}: InventoryModalProps) {
  // Create inventory grid with 20 slots (4x5)
  const INVENTORY_SLOTS = 20;
  const inventorySlots = Array(INVENTORY_SLOTS).fill(null).map((_, i) => inventory[i] || null);

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        backgroundColor: 'rgba(0, 0, 0, 0.9)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 10001,
        padding: '20px',
        boxSizing: 'border-box',
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        style={{
          backgroundColor: COLORS.background.panel,
          borderRadius: '12px',
          border: `3px solid ${COLORS.border.gold}`,
          padding: '24px',
          display: 'flex',
          gap: '40px',
          maxWidth: '700px',
        }}
      >
        {/* Left side: Character with equipment slots */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <h3 style={{ color: COLORS.gold, margin: '0 0 16px 0', fontSize: '18px' }}>
            Ausrüstung
          </h3>

          {/* Character T-pose layout */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '60px 80px 60px',
              gridTemplateRows: '60px 20px 60px 20px 60px 20px 60px',
              gap: '4px',
              justifyItems: 'center',
              alignItems: 'center',
            }}
          >
            {/* Row 1: Head (center) */}
            <div /> {/* empty */}
            <EquipmentSlotBox
              slot="head"
              item={equipment.head}
              onClick={() => equipment.head && onUnequip?.('head')}
            />
            <div /> {/* empty */}

            {/* Row 2: Shoulders/neck area (visual) */}
            <div />
            <div
              style={{
                width: '40px',
                height: '16px',
                backgroundColor: COLORS.background.darker,
                borderRadius: '4px',
              }}
            />
            <div />

            {/* Row 3: Main Hand - Chest - Off Hand */}
            <EquipmentSlotBox
              slot="mainHand"
              item={equipment.mainHand}
              onClick={() => equipment.mainHand && onUnequip?.('mainHand')}
            />
            <EquipmentSlotBox
              slot="chest"
              item={equipment.chest}
              onClick={() => equipment.chest && onUnequip?.('chest')}
              style={{ width: '70px', height: '70px' }}
            />
            <EquipmentSlotBox
              slot="offHand"
              item={equipment.offHand}
              onClick={() => equipment.offHand && onUnequip?.('offHand')}
            />

            {/* Row 4: Arms to body connector (visual) */}
            <div
              style={{
                width: '30px',
                height: '16px',
                backgroundColor: COLORS.background.darker,
                borderRadius: '4px',
              }}
            />
            <div
              style={{
                width: '30px',
                height: '16px',
                backgroundColor: COLORS.background.darker,
                borderRadius: '4px',
              }}
            />
            <div
              style={{
                width: '30px',
                height: '16px',
                backgroundColor: COLORS.background.darker,
                borderRadius: '4px',
              }}
            />

            {/* Row 5: Legs (center) */}
            <div />
            <EquipmentSlotBox
              slot="legs"
              item={equipment.legs}
              onClick={() => equipment.legs && onUnequip?.('legs')}
              style={{ width: '70px' }}
            />
            <div />

            {/* Row 6: Leg connector (visual) */}
            <div />
            <div style={{ display: 'flex', gap: '20px' }}>
              <div
                style={{
                  width: '20px',
                  height: '16px',
                  backgroundColor: COLORS.background.darker,
                  borderRadius: '4px',
                }}
              />
              <div
                style={{
                  width: '20px',
                  height: '16px',
                  backgroundColor: COLORS.background.darker,
                  borderRadius: '4px',
                }}
              />
            </div>
            <div />

            {/* Row 7: Feet (center, split) */}
            <div />
            <div style={{ display: 'flex', gap: '8px' }}>
              <EquipmentSlotBox
                slot="feet"
                item={equipment.feet}
                onClick={() => equipment.feet && onUnequip?.('feet')}
                style={{ width: '50px', height: '50px' }}
              />
            </div>
            <div />
          </div>
        </div>

        {/* Divider */}
        <div
          style={{
            width: '2px',
            backgroundColor: COLORS.border.gold,
            alignSelf: 'stretch',
          }}
        />

        {/* Right side: Inventory grid */}
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <h3 style={{ color: COLORS.gold, margin: '0 0 16px 0', fontSize: '18px' }}>
            Inventar
          </h3>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 50px)',
              gridTemplateRows: 'repeat(5, 50px)',
              gap: '6px',
            }}
          >
            {inventorySlots.map((item, index) => (
              <InventorySlotBox
                key={index}
                item={item}
                onClick={() => item && onEquip?.(item)}
              />
            ))}
          </div>

          {/* Close hint */}
          <div
            style={{
              marginTop: '16px',
              color: COLORS.text.muted,
              fontSize: '12px',
              textAlign: 'center',
            }}
          >
            Drücke [I] oder [ESC] zum Schließen
          </div>
        </div>
      </div>
    </div>
  );
}
