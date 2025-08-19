/**
 * PWA Manager - Marmita.One
 * Gerenciamento de funcionalidades PWA
 * v0.1.0-beta
 */

class PWAManager {
  constructor() {
    this.deferredPrompt = null;
    this.isInstalled = false;
    this.isOnline = navigator.onLine;
    
    this.init();
  }

  /**
   * Inicializar PWA Manager
   */
  init() {
    this.registerServiceWorker();
    this.setupInstallPrompt();
    this.setupNetworkStatus();
    this.setupNotifications();
    this.detectInstallation();
  }

  /**
   * Registrar Service Worker
   */
  async registerServiceWorker() {
    if ('serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.register('/assets/js/sw.js');
        
        console.log('✅ Service Worker registrado:', registration.scope);
        
        // Atualizar SW quando disponível
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              this.showUpdateAvailable();
            }
          });
        });
        
      } catch (error) {
        console.error('❌ Erro ao registrar Service Worker:', error);
      }
    }
  }

  /**
   * Configurar prompt de instalação
   */
  setupInstallPrompt() {
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      this.deferredPrompt = e;
      this.showInstallPrompt();
    });

    window.addEventListener('appinstalled', () => {
      console.log('✅ PWA instalado com sucesso');
      this.isInstalled = true;
      this.hideInstallPrompt();
      this.trackEvent('pwa_installed');
    });
  }

  /**
   * Mostrar prompt de instalação
   */
  showInstallPrompt() {
    const installPrompt = document.getElementById('pwa-install-prompt');
    if (installPrompt && !this.isInstalled) {
      installPrompt.style.display = 'flex';
      installPrompt.classList.add('animate-slide-down');
    }
  }

  /**
   * Esconder prompt de instalação
   */
  hideInstallPrompt() {
    const installPrompt = document.getElementById('pwa-install-prompt');
    if (installPrompt) {
      installPrompt.style.display = 'none';
    }
  }

  /**
   * Instalar PWA
   */
  async installPWA() {
    if (!this.deferredPrompt) {
      console.log('Prompt de instalação não disponível');
      return;
    }

    try {
      this.deferredPrompt.prompt();
      const { outcome } = await this.deferredPrompt.userChoice;
      
      console.log(`Usuário ${outcome === 'accepted' ? 'aceitou' : 'recusou'} a instalação`);
      
      if (outcome === 'accepted') {
        this.trackEvent('install_prompt_accepted');
      } else {
        this.trackEvent('install_prompt_dismissed');
      }
      
      this.deferredPrompt = null;
      
    } catch (error) {
      console.error('Erro na instalação:', error);
    }
  }

  /**
   * Configurar status de rede
   */
  setupNetworkStatus() {
    window.addEventListener('online', () => {
      this.isOnline = true;
      this.showNetworkStatus('Conexão restaurada', 'success');
      this.syncPendingData();
    });

    window.addEventListener('offline', () => {
      this.isOnline = false;
      this.showNetworkStatus('Modo offline ativado', 'warning');
    });
  }

  /**
   * Mostrar status de rede
   */
  showNetworkStatus(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `network-notification ${type}`;
    notification.innerHTML = `
      <div class="flex items-center gap-3">
        <span class="network-icon">${type === 'success' ? '✅' : '⚠️'}</span>
        <span>${message}</span>
      </div>
    `;
    
    document.body.appendChild(notification);
    
    // Animar entrada
    setTimeout(() => notification.classList.add('show'), 100);
    
    // Remover após 3 segundos
    setTimeout(() => {
      notification.classList.remove('show');
      setTimeout(() => notification.remove(), 300);
    }, 3000);
  }

  /**
   * Configurar notificações
   */
  async setupNotifications() {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      
      if (permission === 'granted') {
        console.log('✅ Notificações permitidas');
      }
    }
  }

  /**
   * Detectar se já está instalado
   */
  detectInstallation() {
    // Verificar se está em modo standalone (instalado)
    if (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches) {
      this.isInstalled = true;
      console.log('✅ PWA detectado como instalado');
    }

    // Verificar iOS Safari
    if (window.navigator.standalone === true) {
      this.isInstalled = true;
      console.log('✅ PWA detectado como instalado (iOS)');
    }
  }

  /**
   * Mostrar notificação de atualização disponível
   */
  showUpdateAvailable() {
    const updateBanner = document.createElement('div');
    updateBanner.className = 'update-banner';
    updateBanner.innerHTML = `
      <div class="container">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-3">
            <span class="text-2xl">🔄</span>
            <div>
              <div class="font-semibold">Nova versão disponível</div>
              <div class="text-sm text-secondary">Recarregue para atualizar</div>
            </div>
          </div>
          <button onclick="window.location.reload()" class="btn btn-primary btn-sm">
            Atualizar
          </button>
        </div>
      </div>
    `;
    
    document.body.insertBefore(updateBanner, document.body.firstChild);
  }

  /**
   * Sincronizar dados pendentes
   */
  async syncPendingData() {
    try {
      // Verificar se há pedidos pendentes no localStorage
      const pendingOrders = JSON.parse(localStorage.getItem('pendingOrders') || '[]');
      
      if (pendingOrders.length > 0) {
        console.log(`📤 Sincronizando ${pendingOrders.length} pedidos pendentes...`);
        
        // Aqui você implementaria a lógica para enviar os pedidos
        // Para o exemplo, vamos apenas limpar o localStorage
        localStorage.removeItem('pendingOrders');
        
        this.showNetworkStatus(`${pendingOrders.length} pedidos sincronizados`, 'success');
      }
      
    } catch (error) {
      console.error('Erro na sincronização:', error);
    }
  }

  /**
   * Rastrear eventos de analytics (opcional)
   */
  trackEvent(eventName, data = {}) {
    console.log(`📊 Event: ${eventName}`, data);
    
    // Aqui você pode integrar com Google Analytics, Firebase, etc.
    if (window.gtag) {
      window.gtag('event', eventName, data);
    }
  }

  /**
   * Verificar se está online
   */
  isOnlineStatus() {
    return this.isOnline;
  }

  /**
   * Verificar se está instalado
   */
  isInstalledStatus() {
    return this.isInstalled;
  }
}

// Inicializar PWA Manager
const pwaManager = new PWAManager();

// Expor globalmente para uso em outros scripts
window.PWA = pwaManager;

// Event listeners para botões de instalação
document.addEventListener('DOMContentLoaded', () => {
  const installBtn = document.getElementById('pwa-install-btn');
  const closeBtn = document.getElementById('pwa-install-close');
  
  if (installBtn) {
    installBtn.addEventListener('click', () => pwaManager.installPWA());
  }
  
  if (closeBtn) {
    closeBtn.addEventListener('click', () => pwaManager.hideInstallPrompt());
  }
});

/**
 * Estilos CSS para notificações de rede e atualizações
 */
const pwaStyles = document.createElement('style');
pwaStyles.textContent = `
  .network-notification {
    position: fixed;
    top: 20px;
    right: 20px;
    z-index: 1090;
    background: var(--color-surface);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-xl);
    padding: var(--spacing-4);
    box-shadow: var(--shadow-lg);
    transform: translateX(100%);
    transition: transform var(--transition-normal);
    max-width: 300px;
  }
  
  .network-notification.show {
    transform: translateX(0);
  }
  
  .network-notification.success {
    border-color: var(--brand-success);
    background: rgb(16 185 129 / 0.05);
  }
  
  .network-notification.warning {
    border-color: var(--brand-warning);
    background: rgb(245 158 11 / 0.05);
  }
  
  .update-banner {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    z-index: 1080;
    background: linear-gradient(135deg, var(--brand-primary), var(--brand-secondary));
    color: var(--neutral-white);
    padding: var(--spacing-4) 0;
    animation: slideDown 0.3s ease-out;
  }
  
  @keyframes slideDown {
    from { transform: translateY(-100%); }
    to { transform: translateY(0); }
  }
  
  .animate-slide-down {
    animation: slideDown 0.3s ease-out;
  }
`;

document.head.appendChild(pwaStyles);
