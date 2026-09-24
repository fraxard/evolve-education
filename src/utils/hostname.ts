/**
 * Host Surface Classification & Domain Routing Utilities
 * 
 * Classifies window location into one of three distinct host surfaces:
 * - 'public':  Public marketing website (localhost:5173, domain.com)
 * - 'admin':   Institutional Admin Portal (admin.localhost:5173, admin.domain.com)
 * - 'app':     Operational Application for Teachers & Students (app.localhost:5173, app.domain.com)
 */

export type HostSurface = 'public' | 'admin' | 'app';

/**
 * Classifies a hostname into its operational host surface.
 */
export function getHostSurface(
  hostname: string = typeof window !== 'undefined' ? window.location.hostname : 'localhost'
): HostSurface {
  const h = hostname.toLowerCase();

  // Admin surface: admin.localhost, admin.localhost:5173, admin.domain.com, admin.*
  if (h === 'admin.localhost' || h.startsWith('admin.')) {
    return 'admin';
  }

  // Operational App surface: app.localhost, app.localhost:5173, app.domain.com, app.*
  if (h === 'app.localhost' || h.startsWith('app.')) {
    return 'app';
  }

  // Default: Public website surface
  return 'public';
}

export const isAdminHostname = (): boolean => getHostSurface() === 'admin';
export const isAppHostname = (): boolean => getHostSurface() === 'app';
export const isPublicHostname = (): boolean => getHostSurface() === 'public';

/**
 * Builds an absolute URL pointing to the Admin subdomain.
 * Local dev: http://admin.localhost:5173{path}
 * Production: https://admin.{domain}{path}
 */
export const getAdminUrl = (path: string = '/dashboard'): string => {
  if (typeof window === 'undefined') return path;
  const { protocol, port, hostname } = window.location;

  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    const portPart = port ? `:${port}` : '';
    return `${protocol}//admin.localhost${portPart}${path}`;
  }

  if (hostname === 'admin.localhost') {
    return path;
  }

  if (hostname === 'app.localhost') {
    const portPart = port ? `:${port}` : '';
    return `${protocol}//admin.localhost${portPart}${path}`;
  }

  if (hostname.startsWith('app.')) {
    const domain = hostname.replace(/^app\./, '');
    const portPart = port ? `:${port}` : '';
    return `${protocol}//admin.${domain}${portPart}${path}`;
  }

  if (!hostname.startsWith('admin.')) {
    const domain = hostname.startsWith('www.') ? hostname.slice(4) : hostname;
    const portPart = port ? `:${port}` : '';
    return `${protocol}//admin.${domain}${portPart}${path}`;
  }

  return path;
};

/**
 * Builds an absolute URL pointing to the Operational App subdomain.
 * Local dev: http://app.localhost:5173{path}
 * Production: https://app.{domain}{path}
 */
export const getAppUrl = (path: string = '/dashboard'): string => {
  if (typeof window === 'undefined') return path;
  const { protocol, port, hostname } = window.location;

  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    const portPart = port ? `:${port}` : '';
    return `${protocol}//app.localhost${portPart}${path}`;
  }

  if (hostname === 'app.localhost') {
    return path;
  }

  if (hostname === 'admin.localhost') {
    const portPart = port ? `:${port}` : '';
    return `${protocol}//app.localhost${portPart}${path}`;
  }

  if (hostname.startsWith('admin.')) {
    const domain = hostname.replace(/^admin\./, '');
    const portPart = port ? `:${port}` : '';
    return `${protocol}//app.${domain}${portPart}${path}`;
  }

  if (!hostname.startsWith('app.')) {
    const domain = hostname.startsWith('www.') ? hostname.slice(4) : hostname;
    const portPart = port ? `:${port}` : '';
    return `${protocol}//app.${domain}${portPart}${path}`;
  }

  return path;
};

/**
 * Builds an absolute URL pointing to the Public website.
 * Local dev: http://localhost:5173{path}
 * Production: https://{domain}{path}
 */
export const getPublicUrl = (path: string = '/'): string => {
  if (typeof window === 'undefined') return path;
  const { protocol, port, hostname } = window.location;

  if (hostname === 'admin.localhost' || hostname === 'app.localhost') {
    const portPart = port ? `:${port}` : '';
    return `${protocol}//localhost${portPart}${path}`;
  }

  if (hostname.startsWith('admin.')) {
    const domain = hostname.replace(/^admin\./, '');
    const portPart = port ? `:${port}` : '';
    return `${protocol}//${domain}${portPart}${path}`;
  }

  if (hostname.startsWith('app.')) {
    const domain = hostname.replace(/^app\./, '');
    const portPart = port ? `:${port}` : '';
    return `${protocol}//${domain}${portPart}${path}`;
  }

  return path;
};
