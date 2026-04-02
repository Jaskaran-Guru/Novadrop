import { cookies } from "next/headers";

export async function getMockUserState(adminUserId: string) {
  try {
    const cookieStore = await cookies();
    const stateStr = cookieStore.get(`demo-user-state-${adminUserId}`)?.value;
    if (!stateStr) return {};
    return JSON.parse(stateStr);
  } catch (error) {
    console.error("Failed to read mock user state:", error);
    return {};
  }
}

export async function setMockUserState(adminUserId: string, targetUserId: string, updates: any) {
  try {
    const cookieStore = await cookies();
    const currentState = await getMockUserState(adminUserId);
    
    const newUserState = {
      ...currentState,
      [targetUserId]: {
        ...(currentState[targetUserId] || {}),
        ...updates,
      },
    };

    cookieStore.set(`demo-user-state-${adminUserId}`, JSON.stringify(newUserState), { 
      maxAge: 60 * 60 * 24,
      path: "/",
      sameSite: "lax"
    });
  } catch (error) {
    console.error("Failed to set mock user state:", error);
  }
}

export async function getMockOrders(userId: string) {
  try {
    const cookieStore = await cookies();
    const ordersStr = cookieStore.get(`demo-orders-${userId}`)?.value;
    if (!ordersStr) return [];
    return JSON.parse(ordersStr);
  } catch (error) {
    console.error("Failed to read mock orders:", error);
    return [];
  }
}

export async function addMockOrder(userId: string, order: any) {
  try {
    const cookieStore = await cookies();
    const currentOrders = await getMockOrders(userId);
    const newOrders = [order, ...currentOrders];
    cookieStore.set(`demo-orders-${userId}`, JSON.stringify(newOrders), { 
      maxAge: 60 * 60 * 24,
      path: "/",
      sameSite: "lax"
    });
  } catch (error) {
    console.error("Failed to add mock order:", error);
  }
}

export async function removeMockOrder(userId: string, orderId: string) {
  try {
    const cookieStore = await cookies();
    const currentOrders = await getMockOrders(userId);
    const newOrders = currentOrders.filter((o: any) => o.id !== orderId);
    cookieStore.set(`demo-orders-${userId}`, JSON.stringify(newOrders), { 
      maxAge: 60 * 60 * 24,
      path: "/",
      sameSite: "lax"
    });
  } catch (error) {
    console.error("Failed to remove mock order:", error);
  }
}

export async function updateMockOrder(userId: string, orderId: string, status: string) {
  try {
    const cookieStore = await cookies();
    const currentOrders = await getMockOrders(userId);
    const newOrders = currentOrders.map((o: any) => 
      o.id === orderId ? { ...o, status } : o
    );
    cookieStore.set(`demo-orders-${userId}`, JSON.stringify(newOrders), { 
      maxAge: 60 * 60 * 24,
      path: "/",
      sameSite: "lax"
    });
  } catch (error) {
    console.error("Failed to update mock order:", error);
  }
}
