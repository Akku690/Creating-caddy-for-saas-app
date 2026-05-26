export class CreatePageDto {
  tenantId: number;
  title: string;
  slug?: string;
  description?: string;
}

export class PageResponseDto {
  id: number;
  tenantId: number;
  title: string;
  slug: string;
  description: string;
  url: string;
  status: string;
  createdAt: string;
}

export class UpdatePageDto {
  title?: string;
  description?: string;
}
