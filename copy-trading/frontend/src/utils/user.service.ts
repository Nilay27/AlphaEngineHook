import axios from 'axios';
import { prodConfig } from '../config/production.config';

class UserService {

  async getUserAccount(userAddress: string) {
    try {
      const response = await axios.get(`${prodConfig.urls.infraBaseUrl}/user/account`, {
        params: { userAddress },
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching user account:', error);
    }
  }


  async getUserBuyTokenHistory(userAddress: string) {
    try {
      const response = await axios.get(`${prodConfig.urls.infraBaseUrl}/user/history/buy-tokens`, {
        params: { userAddress },
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching buy token history:', error);
    }
  }

  async getUserClaimableRewards(userAddress: string) {
    try {
      const response = await axios.get(`${prodConfig.urls.infraBaseUrl}/user/history/claimable-rewards`, {
        params: { userAddress },
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching claimable rewards:', error);
    }
  }

  async getMarkets(userAddress: string) {
    try {
      const response = await axios.get(`${prodConfig.urls.infraBaseUrl}/user/markets`, {
        params: { userAddress },
      });
      return response.data;
    } catch (error) {
      console.error("Error fetching markets:", error);
      throw error;
    }
  }

  async getAllActiveMarkets() {
    try {
      const response = await axios.get(`${prodConfig.urls.infraBaseUrl}/market/active`);
      return response.data;
    } catch (error) {
      console.error("Error fetching markets:", error);
      throw error;
    }
  }
}

const userService = new UserService();
export default userService;
