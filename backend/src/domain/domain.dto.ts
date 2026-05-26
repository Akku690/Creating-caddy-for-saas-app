export class DomainConnectDto {
  tenantId: number;
  domain: string;
}

export class DomainVerifyDto {
  tenantId: number;
  domain: string;
  verificationMethod: 'CNAME' | 'TXT';
  verificationValue: string;
}

export class DomainResponseDto {
  id: number;
  tenantId: number;
  domain: string;
  type: string;
  status: string;
  verificationToken: string;
  verificationMethod: string;
  createdAt: string;
  verifiedAt?: string;
}
