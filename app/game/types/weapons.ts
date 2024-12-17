export interface WeaponModification {
  id: string;
  name: string;
  type: 'scope' | 'stabilizer' | 'suppressor' | 'barrel';
  stats: Partial<WeaponStats>;
}

export interface WeaponStats {
  damage: number;
  accuracy: number;
  recoil: number;
  stability: number;
  range: number;
  bulletDrop: number;
  windAffect: number;
}

export interface AmmoType {
  id: string;
  name: string;
  type: 'standard' | 'armor_piercing' | 'emp';
  stats: Partial<WeaponStats>;
  effects: {
    penetration?: number;
    empDuration?: number;
  };
}