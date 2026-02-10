class SettingsService {
  constructor() {
    this.baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
  }

  getAuthHeaders() {
    const token = localStorage.getItem('fefa_access_token');
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };
  }

  async getSettings() {
    try {
      const response = await fetch(`${this.baseURL}/settings`, {
        method: 'GET',
        headers: this.getAuthHeaders()
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch settings');
      }

      return {
        success: true,
        data: data.data
      };
    } catch (error) {
      console.error('Get settings error:', error);
      return {
        success: false,
        error: error.message || 'Failed to fetch settings'
      };
    }
  }

  async updateSettings(settingsData) {
    try {
      const response = await fetch(`${this.baseURL}/settings`, {
        method: 'PUT',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(settingsData)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to update settings');
      }

      return {
        success: true,
        data: data.data,
        message: data.message || 'Settings updated successfully'
      };
    } catch (error) {
      console.error('Update settings error:', error);
      return {
        success: false,
        error: error.message || 'Failed to update settings'
      };
    }
  }

  async sendTestEmail(email) {
    try {
      const response = await fetch(`${this.baseURL}/settings/test-email`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({ email })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to send test email');
      }

      return {
        success: true,
        message: data.message || 'Test email sent successfully'
      };
    } catch (error) {
      console.error('Send test email error:', error);
      return {
        success: false,
        error: error.message || 'Failed to send test email'
      };
    }
  }

  async getShippingStatus() {
    try {
      const response = await fetch(`${this.baseURL}/shipping/admin/status`, {
        method: 'GET',
        headers: this.getAuthHeaders()
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch shipping status');
      }

      return { success: true, data: data.data };
    } catch (error) {
      console.error('Get shipping status error:', error);
      return { success: false, error: error.message || 'Failed to fetch shipping status' };
    }
  }

  async testShippingConnection() {
    try {
      const response = await fetch(`${this.baseURL}/shipping/admin/test-connection`, {
        method: 'POST',
        headers: this.getAuthHeaders()
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Failed to test shipping connection');
      }

      return { success: true, data: data.data, message: data.message };
    } catch (error) {
      console.error('Test shipping connection error:', error);
      return { success: false, error: error.message || 'Failed to test shipping connection' };
    }
  }

  async updateShippingConfig(config) {
    try {
      const response = await fetch(`${this.baseURL}/shipping/admin/config`, {
        method: 'PUT',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(config)
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Failed to update shipping config');
      }

      return { success: true, data: data.data, message: data.message };
    } catch (error) {
      console.error('Update shipping config error:', error);
      return { success: false, error: error.message || 'Failed to update shipping config' };
    }
  }
}

export default new SettingsService();
