const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";

// Helper function to get auth headers
const getAuthHeaders = () => {
  const token =
    localStorage.getItem("auth-token") ||
    sessionStorage.getItem("auth-token") ||
    localStorage.getItem("token") ||
    sessionStorage.getItem("token");
  return {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

export class AdminUsersService {
  // Get all admin users
  static async getAll(params?: {
    page?: number;
    size?: number;
    search?: string;
  }) {
    try {
      const url = new URL(`${API_BASE_URL}/adminusers`);
      if (params?.page) url.searchParams.append("page", params.page.toString());
      if (params?.size) url.searchParams.append("size", params.size.toString());
      if (params?.search) url.searchParams.append("search", params.search);

      console.log("AdminUsersService - URL being called:", url.toString());
      console.log("AdminUsersService - Search parameter:", params?.search);

      const response = await fetch(url.toString(), {
        headers: getAuthHeaders(),
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `Failed to fetch admin users: ${response.status} ${response.statusText} - ${errorText}`
        );
      }

      // Check if response has content
      const text = await response.text();

      if (!text) {
        return { data: [], meta: { total: 0 } };
      }

      try {
        const parsed = JSON.parse(text);
        return parsed;
      } catch (error) {
        console.error("Failed to parse JSON response:", text);
        throw new Error("Invalid JSON response from server");
      }
    } catch (error) {
      console.error("Error fetching admin users:", error);
      throw error;
    }
  }

  // Get single admin user
  static async getById(id) {
    try {
      const response = await fetch(`${API_BASE_URL}/adminusers/${id}`, {
        headers: getAuthHeaders(),
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `Failed to fetch admin user: ${response.status} ${response.statusText} - ${errorText}`
        );
      }

      const text = await response.text();
      if (!text) {
        throw new Error("Empty response from server");
      }

      try {
        const data = JSON.parse(text);
        return data.data;
      } catch (error) {
        console.error("Failed to parse JSON response:", text);
        throw new Error("Invalid JSON response from server");
      }
    } catch (error) {
      console.error("Error fetching admin user:", error);
      throw error;
    }
  }

  // Create new admin user
  static async create(userData) {
    try {
      const response = await fetch(`${API_BASE_URL}/adminusers/add`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `Failed to create admin user: ${response.status} ${response.statusText} - ${errorText}`
        );
      }

      const text = await response.text();
      if (!text) {
        throw new Error("Empty response from server");
      }

      try {
        const data = JSON.parse(text);
        return data.data;
      } catch (error) {
        console.error("Failed to parse JSON response:", text);
        throw new Error("Invalid JSON response from server");
      }
    } catch (error) {
      console.error("Error creating admin user:", error);
      throw error;
    }
  }

  // Update admin user
  static async update(id, userData) {
    try {
      const response = await fetch(`${API_BASE_URL}/adminusers/update/${id}`, {
        method: "PUT",
        headers: getAuthHeaders(),
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `Failed to update admin user: ${response.status} ${response.statusText} - ${errorText}`
        );
      }

      const text = await response.text();
      if (!text) {
        throw new Error("Empty response from server");
      }

      try {
        const data = JSON.parse(text);
        return data.data;
      } catch (error) {
        console.error("Failed to parse JSON response:", text);
        throw new Error("Invalid JSON response from server");
      }
    } catch (error) {
      console.error("Error updating admin user:", error);
      throw error;
    }
  }

  // Delete admin user
  static async delete(id) {
    try {
      const response = await fetch(`${API_BASE_URL}/adminusers/${id}`, {
        method: "DELETE",
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `Failed to delete admin user: ${response.status} ${response.statusText} - ${errorText}`
        );
      }

      const text = await response.text();
      if (!text) {
        return; // DELETE operations might not return content
      }

      try {
        const data = JSON.parse(text);
        return data;
      } catch (error) {
        console.error("Failed to parse JSON response:", text);
        throw new Error("Invalid JSON response from server");
      }
    } catch (error) {
      console.error("Error deleting admin user:", error);
      throw error;
    }
  }
}
