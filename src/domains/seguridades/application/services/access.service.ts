import { Injectable, NotFoundException } from '@nestjs/common';
import { UserRoleRepository } from '../../infrastructure/repositories/user-role.repository';
import { PaginationDto } from '@/common/dto/pagination.dto';
import { PaginationHelper } from '@/common/helpers/pagination.helper';
import { ResponseHelper } from '@/common/messages/response.helper';
import { MessageCode } from '@/common/messages/message-codes';

interface AccessFilters {
  userId?: string;
  roleId?: string;
  branchId?: string;
  status?: number;
}

@Injectable()
export class AccessService {
  constructor(
    private readonly userRoleRepository: UserRoleRepository,
    private readonly responseHelper: ResponseHelper,
  ) {}

  async findPaginated(pagination: PaginationDto, filters: AccessFilters = {}, lang = 'es') {
    const { page, limit, skip } = PaginationHelper.normalizeParams(pagination);
    const [items, total] = await this.userRoleRepository.findWithPagination(skip, limit, filters);

    const payload = PaginationHelper.createPaginatedResponse(items, total, page, limit);
    return await this.responseHelper.successResponse(payload, MessageCode.SUCCESS, lang);
  }

  async findOne(id: string, lang = 'es') {
    const access = await this.userRoleRepository.findOne(id);

    if (!access) {
      throw new NotFoundException(
        await this.responseHelper.errorResponse(
          MessageCode.NOT_FOUND,
          lang,
          {
            error: 'ACCESS_NOT_FOUND',
            accessId: id,
            message: 'Access relationship not found in database',
          },
          404,
        ),
      );
    }

    return await this.responseHelper.successResponse(access, MessageCode.SUCCESS, lang);
  }
}


