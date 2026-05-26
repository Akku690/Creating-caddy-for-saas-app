export class TenantDto {
  company: string;
  subdomain: string;
  customDomain?: string;
  themeColor?: string;
  logo?: string;
  email: string;
}

export class TenantResponseDto {
  id: number;
  company: string;
  subdomain: string;
  customDomain?: string;
  themeColor: string;
  logo: string;
  email: string;
  status: string;
  createdAt: string;
}
