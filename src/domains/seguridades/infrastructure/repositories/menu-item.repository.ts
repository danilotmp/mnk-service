import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MenuItemEntity } from '../entities/menu-item.entity';

/**
 * Repositorio para la entidad MenuItem
 */
@Injectable()
export class MenuItemRepository {
  constructor(
    @InjectRepository(MenuItemEntity)
    private repository: Repository<MenuItemEntity>,
  ) {}

  findAll(): Promise<MenuItemEntity[]> {
    return this.repository.find({
      where: { isActive: true },
      relations: ['permission'],
      order: { order: 'ASC' },
    });
  }

  findPublic(): Promise<MenuItemEntity[]> {
    return this.repository.find({
      where: { isPublic: true, isActive: true },
      relations: ['permission'],
      order: { order: 'ASC' },
    });
  }

  findByRoute(route: string): Promise<MenuItemEntity | null> {
    return this.repository.findOne({
      where: { route, isActive: true },
      relations: ['permission', 'parent'],
    });
  }

  findByMenuId(menuId: string): Promise<MenuItemEntity | null> {
    return this.repository.findOne({
      where: { menuId, isActive: true },
      relations: ['permission', 'parent', 'children'],
    });
  }

  findRootItems(): Promise<MenuItemEntity[]> {
    return this.repository.find({
      where: { parentId: null, isActive: true },
      relations: ['permission', 'children'],
      order: { order: 'ASC' },
    });
  }

  create(menuItemData: Partial<MenuItemEntity>): MenuItemEntity {
    return this.repository.create(menuItemData);
  }

  async save(menuItem: MenuItemEntity): Promise<MenuItemEntity> {
    return this.repository.save(menuItem);
  }

  async delete(id: string): Promise<void> {
    await this.repository.delete(id);
  }
}
