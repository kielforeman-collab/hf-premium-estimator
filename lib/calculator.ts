export interface Room {
  id: string;
  name: string;
  length: number;
  width: number;
  height: number;
  windows: number;
  doors: number;
  complexity: number;
}

export interface LineItem {
  id: string;
  description: string;
  amount: number;
}

export interface PricingSettings {
  laborRate: number;
  paintCost: number;
  markup: number;
  taxRate: number;
}

export function calculateRoomArea(room: Room) {
  // wall area = 2 * (L*H + W*H)
  // subtract windows (approx 15 sqft) and doors (approx 21 sqft)
  let wallArea = 2 * (room.length * room.height + room.width * room.height);
  wallArea -= (room.windows * 15) + (room.doors * 21);
  return Math.max(0, wallArea);
}

export function calculateTotals(rooms: Room[], settings: PricingSettings, materialItems: LineItem[] = [], laborItems: LineItem[] = []) {
  let totalWallArea = 0;
  let totalLaborHours = 0;

  rooms.forEach(room => {
    const wallArea = calculateRoomArea(room);
    totalWallArea += wallArea;
    
    // Base hours: 125 sqft per hour (standard)
    const baseHours = wallArea / 125; 
    totalLaborHours += baseHours * room.complexity;
  });

  // 1 gallon covers approx 400 sqft (2 coats)
  const gallonsNeeded = Math.ceil(totalWallArea / 400) * 2;
  
  // Base costs
  let materialCost = (gallonsNeeded * settings.paintCost) + (gallonsNeeded * 10); // +$10 for supplies per gallon
  let laborCost = totalLaborHours * settings.laborRate;

  // Add custom line items
  materialItems.forEach(item => materialCost += item.amount);
  laborItems.forEach(item => laborCost += item.amount);
  
  const subtotal = materialCost + laborCost;
  const markupAmount = subtotal * (settings.markup / 100);
  const taxableAmount = subtotal + markupAmount;
  const taxAmount = taxableAmount * (settings.taxRate / 100);
  const finalTotal = taxableAmount + taxAmount;

  return {
    totalWallArea,
    gallonsNeeded,
    materialCost,
    laborCost,
    subtotal,
    markupAmount,
    taxAmount,
    finalTotal
  };
}
