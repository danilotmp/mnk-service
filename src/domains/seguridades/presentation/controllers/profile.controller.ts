import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../infrastructure/guards/jwt-auth.guard';
import { CompanyService } from '../../application/services/company.service';
import { BranchService } from '../../application/services/branch.service';
import { ResponseHelper } from '@/common/messages/response.helper';
import { MessageCode } from '@/common/messages/message-codes';

/**
 * Controller de Perfil y Contexto del Usuario
 * 
 * Endpoints para que el usuario acceda a SU información y contexto
 * sin necesidad de permisos administrativos.
 * 
 * Solo requiere estar autenticado (JWT válido).
 */
@ApiTags('Perfil y Contexto')
@Controller('auth/me')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ProfileController {
  constructor(
    private companyService: CompanyService,
    private branchService: BranchService,
    private responseHelper: ResponseHelper,
  ) {}

  // ============================================
  // EMPRESAS DEL USUARIO (Sin permisos administrativos)
  // ============================================

  @Get('companies')
  @ApiOperation({
    summary: 'Obtener mis empresas disponibles',
    description: 'Retorna las empresas a las que el usuario tiene acceso. No requiere permisos administrativos.',
  })
  @ApiResponse({ status: 200, description: 'Lista de empresas del usuario' })
  @ApiResponse({ status: 401, description: 'No autenticado' })
  async getMyCompanies(@Request() req) {
    const lang = req.headers['accept-language'] || 'es';
    const userId = req.user.userId;
    const companyId = req.user.companyId;

    // Por ahora, devolver la empresa del usuario
    // En el futuro, si implementas multi-empresa, aquí traerías todas las empresas del usuario
    const company = await this.companyService.findOne(companyId, lang);

    // Retornar como array para consistencia con el futuro multi-empresa
    return await this.responseHelper.successResponse(
      [company.data],
      MessageCode.SUCCESS,
      lang,
    );
  }

  @Get('companies/:id')
  @ApiOperation({
    summary: 'Obtener detalles de una de mis empresas',
    description: 'Retorna información detallada de una empresa a la que el usuario tiene acceso.',
  })
  @ApiParam({ name: 'id', description: 'ID de la empresa (UUID)', type: String })
  @ApiResponse({ status: 200, description: 'Detalles de la empresa' })
  @ApiResponse({ status: 403, description: 'Sin acceso a esta empresa' })
  @ApiResponse({ status: 404, description: 'Empresa no encontrada' })
  async getMyCompany(@Param('id') id: string, @Request() req) {
    const lang = req.headers['accept-language'] || 'es';
    const userCompanyId = req.user.companyId;

    // Validar que el usuario tenga acceso a esta empresa
    if (id !== userCompanyId) {
      return await this.responseHelper.errorResponse(
        MessageCode.INSUFFICIENT_PERMISSIONS,
        lang,
        { message: 'No tienes acceso a esta empresa' },
        403,
      );
    }

    return await this.companyService.findOne(id, lang);
  }

  // ============================================
  // SUCURSALES DEL USUARIO (Sin permisos administrativos)
  // ============================================

  @Get('branches')
  @ApiOperation({
    summary: 'Obtener mis sucursales disponibles',
    description: 'Retorna las sucursales de mi empresa a las que tengo acceso. No requiere permisos administrativos.',
  })
  @ApiResponse({ status: 200, description: 'Lista de sucursales disponibles' })
  @ApiResponse({ status: 401, description: 'No autenticado' })
  async getMyBranches(@Request() req) {
    const lang = req.headers['accept-language'] || 'es';
    const companyId = req.user.companyId;

    // Obtener todas las sucursales de la empresa del usuario
    return await this.branchService.findByCompany(companyId, lang);
  }

  @Get('branches/:id')
  @ApiOperation({
    summary: 'Obtener detalles de una de mis sucursales',
    description: 'Retorna información detallada de una sucursal a la que el usuario tiene acceso.',
  })
  @ApiParam({ name: 'id', description: 'ID de la sucursal (UUID)', type: String })
  @ApiResponse({ status: 200, description: 'Detalles de la sucursal' })
  @ApiResponse({ status: 403, description: 'Sin acceso a esta sucursal' })
  @ApiResponse({ status: 404, description: 'Sucursal no encontrada' })
  async getMyBranch(@Param('id') id: string, @Request() req) {
    const lang = req.headers['accept-language'] || 'es';
    const companyId = req.user.companyId;

    // Obtener la sucursal
    const branchResponse = await this.branchService.findOne(id, lang);
    const branch = branchResponse.data;

    // Validar que la sucursal pertenezca a la empresa del usuario
    if (branch.companyId !== companyId) {
      return await this.responseHelper.errorResponse(
        MessageCode.INSUFFICIENT_PERMISSIONS,
        lang,
        { message: 'No tienes acceso a esta sucursal' },
        403,
      );
    }

    return branchResponse;
  }

  // ============================================
  // CAMBIO DE CONTEXTO (Sin permisos administrativos)
  // ============================================

  @Post('switch-branch')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Cambiar sucursal activa',
    description: 'Permite al usuario cambiar su contexto a otra sucursal de su empresa.',
  })
  @ApiResponse({ status: 200, description: 'Sucursal cambiada exitosamente' })
  @ApiResponse({ status: 403, description: 'Sin acceso a esta sucursal' })
  @ApiResponse({ status: 404, description: 'Sucursal no encontrada' })
  async switchBranch(@Body() body: { branchId: string }, @Request() req) {
    const lang = req.headers['accept-language'] || 'es';
    const companyId = req.user.companyId;
    const { branchId } = body;

    // Obtener la sucursal
    const branchResponse = await this.branchService.findOne(branchId, lang);
    const branch = branchResponse.data;

    // Validar que la sucursal pertenezca a la empresa del usuario
    if (branch.companyId !== companyId) {
      return await this.responseHelper.errorResponse(
        MessageCode.INSUFFICIENT_PERMISSIONS,
        lang,
        { message: 'No tienes acceso a esta sucursal' },
        403,
      );
    }

    // Aquí podrías actualizar el currentBranchId del usuario en la BD si lo deseas
    // Por ahora, simplemente confirmamos el cambio
    
    return await this.responseHelper.successResponse(
      {
        branchId: branch.id,
        branchCode: branch.code,
        branchName: branch.name,
        message: 'Contexto de sucursal actualizado',
      },
      MessageCode.SUCCESS,
      lang,
    );
  }
}


