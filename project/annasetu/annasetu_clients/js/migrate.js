// Data Migration Utility for moving donations from localStorage to Database
const MigrationUtil = {
  // Check if user has old localStorage donations
  hasOldDonations() {
    try {
      const donations = JSON.parse(localStorage.getItem('donations') || '[]');
      return Array.isArray(donations) && donations.length > 0;
    } catch (err) {
      console.warn('Failed to check old donations:', err);
      return false;
    }
  },

  // Get count of old donations
  getOldDonationsCount() {
    try {
      const donations = JSON.parse(localStorage.getItem('donations') || '[]');
      const user = JSON.parse(localStorage.getItem('user') || 'null');
      const currentUserId = user?.id || user?._id || user?.email;
      
      // Filter to get only user's own donations
      const userDonations = donations.filter(d => !d.userId || d.userId === currentUserId);
      return userDonations.length;
    } catch (err) {
      return 0;
    }
  },

  // Get old donations
  getOldDonations() {
    try {
      const donations = JSON.parse(localStorage.getItem('donations') || '[]');
      const user = JSON.parse(localStorage.getItem('user') || 'null');
      const currentUserId = user?.id || user?._id || user?.email;
      
      // Filter to get only user's own donations
      const userDonations = donations.filter(d => !d.userId || d.userId === currentUserId);
      return userDonations;
    } catch (err) {
      console.warn('Failed to get old donations:', err);
      return [];
    }
  },

  // Migrate all old donations to database
  async migrateAll() {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        return {
          success: false,
          message: 'No token found. Please log in first.'
        };
      }

      const oldDonations = this.getOldDonations();
      if (oldDonations.length === 0) {
        return {
          success: false,
          message: 'No old donations found in localStorage'
        };
      }

      console.log(`🔄 Starting migration of ${oldDonations.length} donations...`);

      const response = await fetch('http://localhost:5000/api/donations/migrate-from-localstorage', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ donations: oldDonations })
      });

      const result = await response.json();

      if (response.ok) {
        console.log('✅ Migration successful:', result);
        // Clear old donations from localStorage after successful migration
        localStorage.removeItem('donations');
        return {
          success: true,
          message: result.message,
          migrated: result.migrated,
          failed: result.failed
        };
      } else {
        console.error('❌ Migration failed:', result);
        return {
          success: false,
          message: result.message || 'Unknown error during migration'
        };
      }
    } catch (error) {
      console.error('❌ Migration error:', error);
      return {
        success: false,
        message: 'Error: ' + error.message
      };
    }
  },

  // Show migration prompt to user
  showMigrationPrompt() {
    if (!this.hasOldDonations()) {
      return; // No old donations, nothing to migrate
    }

    const count = this.getOldDonationsCount();
    const migrationPrompt = document.createElement('div');
    migrationPrompt.id = 'migrationPrompt';
    migrationPrompt.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: white;
      padding: 30px;
      border-radius: 12px;
      box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
      z-index: 9999;
      max-width: 400px;
      font-family: 'Poppins', sans-serif;
      text-align: center;
    `;

    migrationPrompt.innerHTML = `
      <h2 style="color: #333; margin-top: 0;">📦 Old Donations Found</h2>
      <p style="color: #666; margin: 10px 0;">
        We found <strong>${count} donation(s)</strong> in your old local storage.
      </p>
      <p style="color: #666; margin: 10px 0;">
        Would you like to migrate them to the database so they're visible to other users?
      </p>
      <div style="margin-top: 20px; display: flex; gap: 10px;">
        <button id="migrateYes" style="
          flex: 1;
          padding: 10px 20px;
          background: #4CAF50;
          color: white;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          font-weight: 600;
          font-family: 'Poppins', sans-serif;
        ">✓ Migrate Now</button>
        <button id="migrateNo" style="
          flex: 1;
          padding: 10px 20px;
          background: #f5f5f5;
          color: #333;
          border: 1px solid #ddd;
          border-radius: 6px;
          cursor: pointer;
          font-weight: 600;
          font-family: 'Poppins', sans-serif;
        ">✗ Later</button>
      </div>
    `;

    document.body.appendChild(migrationPrompt);

    // Add overlay
    const overlay = document.createElement('div');
    overlay.id = 'migrationOverlay';
    overlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.5);
      z-index: 9998;
    `;
    document.body.appendChild(overlay);

    // Event listeners
    document.getElementById('migrateYes').addEventListener('click', async () => {
      const button = document.getElementById('migrateYes');
      button.disabled = true;
      button.textContent = '⏳ Migrating...';

      const result = await this.migrateAll();

      if (result.success) {
        button.style.background = '#4CAF50';
        button.textContent = '✅ Migration Complete!';
        setTimeout(() => {
          document.getElementById('migrationPrompt').remove();
          document.getElementById('migrationOverlay').remove();
          alert(`Success! ${result.migrated} donations migrated.`);
          window.location.reload();
        }, 1500);
      } else {
        alert('Migration failed: ' + result.message);
        button.disabled = false;
        button.textContent = '✓ Migrate Now';
      }
    });

    document.getElementById('migrateNo').addEventListener('click', () => {
      document.getElementById('migrationPrompt').remove();
      document.getElementById('migrationOverlay').remove();
      // Store that user dismissed the prompt (optional)
      localStorage.setItem('migrationPromptDismissed', 'true');
    });
  }
};

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
  module.exports = MigrationUtil;
}
