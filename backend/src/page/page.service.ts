import { Injectable } from '@nestjs/common';
import { FileStorageService } from '../common/storage.service';
import { CreatePageDto, UpdatePageDto } from './page.dto';

@Injectable()
export class PageService {
  constructor(private readonly storage: FileStorageService) {}

  async getAllPages() {
    return this.storage.readJSON('pages');
  }

  async getPagesByTenant(tenantId: number) {
    const pages = await this.storage.readJSON('pages');
    return pages.filter((p: any) => p.tenantId === tenantId);
  }

  async getPageById(id: number) {
    return this.storage.findById('pages', id);
  }

  async createPage(dto: CreatePageDto, tenant: any) {
    // Generate slug from title if not provided
    const slug = dto.slug || dto.title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');

    const newPage = {
      tenantId: dto.tenantId,
      title: dto.title,
      slug: slug,
      description: dto.description || '',
      url: `${tenant.subdomain}.plantgen.live/${slug === 'home' ? '' : slug}`,
      status: 'active',
      createdAt: new Date().toISOString(),
    };

    return this.storage.create('pages', newPage);
  }

  async updatePage(id: number, tenantId: number, dto: UpdatePageDto) {
    const pages = await this.storage.readJSON('pages');
    const page = pages.find((p: any) => p.id === id && p.tenantId === tenantId);

    if (!page) {
      throw new Error('Page not found');
    }

    if (dto.title) {
      page.title = dto.title;
    }
    if (dto.description !== undefined) {
      page.description = dto.description;
    }

    await this.storage.writeJSON('pages', pages);
    return page;
  }

  async deletePage(id: number, tenantId: number) {
    const pages = await this.storage.readJSON('pages');
    const index = pages.findIndex((p: any) => p.id === id && p.tenantId === tenantId);

    if (index === -1) {
      throw new Error('Page not found');
    }

    pages.splice(index, 1);
    await this.storage.writeJSON('pages', pages);
    return { success: true, id };
  }
}
