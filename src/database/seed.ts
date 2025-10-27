import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { CompanyEntity } from '../domains/seguridades/infrastructure/entities/company.entity';
import { BranchEntity } from '../domains/seguridades/infrastructure/entities/branch.entity';
import { UsuarioEntity } from '../domains/seguridades/infrastructure/entities/usuario.entity';

/**
 * Script de seeding para poblar la base de datos con datos de prueba
 */
async function seed() {
  console.log('🌱 Iniciando seeding de datos...');

  // Configurar conexión a la base de datos
  const AppDataSource = new DataSource({
    type: 'sqlite',
    database: 'mnk_service.db',
    entities: [__dirname + '/../**/*.entity{.ts,.js}'],
    synchronize: true,
  });

  try {
    // Conectar a la base de datos
    await AppDataSource.initialize();
    console.log('✅ Conectado a la base de datos');

    const companyRepository = AppDataSource.getRepository(CompanyEntity);
    const branchRepository = AppDataSource.getRepository(BranchEntity);
    const usuarioRepository = AppDataSource.getRepository(UsuarioEntity);

    // Verificar si ya existen datos
    const existingCompany = await companyRepository.findOne({ where: { code: 'MNK' } });
    if (existingCompany) {
      console.log('⚠️  Ya existen datos de prueba. Para recrear, borra la base de datos y ejecuta este script nuevamente.');
      await AppDataSource.destroy();
      return;
    }

    // 1. Crear Empresa
    console.log('📦 Creando empresa...');
    const company = companyRepository.create({
      code: 'MNK',
      name: 'MNK Solutions S.A.',
      description: 'Empresa de desarrollo de software multiempresa',
      email: 'contacto@mnksolutions.com',
      address: {
        street: 'Av. Principal 123',
        city: 'Quito',
        state: 'Pichincha',
        country: 'Ecuador',
        zipCode: '170135',
      },
      settings: {
        currency: 'USD',
        timezone: 'America/Guayaquil',
        language: 'es',
      },
      subscriptionPlan: {
        name: 'Premium',
        features: ['multi-company', 'multi-branch', 'custom-reports'],
        maxBranches: 10,
        maxUsers: 100,
      },
      isActive: true,
    });
    const savedCompany = await companyRepository.save(company);
    console.log(`✅ Empresa creada: ${savedCompany.name} (ID: ${savedCompany.id})`);

    // 2. Crear Sucursales
    console.log('🏢 Creando sucursales...');
    
    // Sucursal Principal
    const branchQuito = branchRepository.create({
      companyId: savedCompany.id,
      code: 'MNK-QUITO',
      name: 'Sucursal Quito',
      type: 'headquarters',
      address: {
        street: 'Av. Principal 123',
        city: 'Quito',
        state: 'Pichincha',
        country: 'Ecuador',
        zipCode: '170135',
      },
      contactInfo: {
        phone: '+593 2 2345678',
        email: 'quito@mnksolutions.com',
      },
      settings: {
        isActive: true,
        allowsRemoteWork: true,
      },
      isActive: true,
    });
    const savedBranchQuito = await branchRepository.save(branchQuito);
    console.log(`✅ Sucursal creada: ${savedBranchQuito.name} (ID: ${savedBranchQuito.id})`);

    // Sucursal Secundaria
    const branchGuayaquil = branchRepository.create({
      companyId: savedCompany.id,
      code: 'MNK-GUAYAQUIL',
      name: 'Sucursal Guayaquil',
      type: 'branch',
      address: {
        street: 'Av. 9 de Octubre 456',
        city: 'Guayaquil',
        state: 'Guayas',
        country: 'Ecuador',
        zipCode: '090101',
      },
      contactInfo: {
        phone: '+593 4 5678901',
        email: 'guayaquil@mnksolutions.com',
      },
      settings: {
        isActive: true,
        allowsRemoteWork: true,
      },
      isActive: true,
    });
    const savedBranchGuayaquil = await branchRepository.save(branchGuayaquil);
    console.log(`✅ Sucursal creada: ${savedBranchGuayaquil.name} (ID: ${savedBranchGuayaquil.id})`);

    // 3. Crear Usuarios
    console.log('👤 Creando usuarios...');

    // Usuario Administrador
    const hashedAdminPassword = await bcrypt.hash('Admin123!', 10);
    const adminUser = usuarioRepository.create({
      email: 'admin@mnksolutions.com',
      password: hashedAdminPassword,
      firstName: 'Admin',
      lastName: 'Sistema',
      companyId: savedCompany.id,
      currentBranchId: savedBranchQuito.id,
      availableBranches: [
        {
          branchId: savedBranchQuito.id,
          branchCode: savedBranchQuito.code,
          role: 'admin',
          permissions: ['*'], // Todos los permisos
          accessLevel: 'full',
        },
        {
          branchId: savedBranchGuayaquil.id,
          branchCode: savedBranchGuayaquil.code,
          role: 'admin',
          permissions: ['*'],
          accessLevel: 'full',
        },
      ],
      roles: [
        {
          id: 'admin',
          name: 'Administrador',
          code: 'ADMIN',
          permissions: ['*'],
        },
      ],
      permissions: [
        { code: 'users.view', name: 'Ver usuarios' },
        { code: 'users.create', name: 'Crear usuarios' },
        { code: 'users.edit', name: 'Editar usuarios' },
        { code: 'users.delete', name: 'Eliminar usuarios' },
        { code: 'branches.view', name: 'Ver sucursales' },
        { code: 'branches.manage', name: 'Gestionar sucursales' },
        { code: 'reports.view', name: 'Ver reportes' },
        { code: 'reports.export', name: 'Exportar reportes' },
      ],
      isActive: true,
    });
    const savedAdminUser = await usuarioRepository.save(adminUser);
    console.log(`✅ Usuario creado: ${savedAdminUser.email} (ID: ${savedAdminUser.id})`);
    console.log(`   📧 Email: admin@mnksolutions.com`);
    console.log(`   🔑 Password: Admin123!`);

    // Usuario de Prueba
    const hashedTestPassword = await bcrypt.hash('Test123!', 10);
    const testUser = usuarioRepository.create({
      email: 'test@mnksolutions.com',
      password: hashedTestPassword,
      firstName: 'Test',
      lastName: 'Usuario',
      companyId: savedCompany.id,
      currentBranchId: savedBranchGuayaquil.id,
      availableBranches: [
        {
          branchId: savedBranchGuayaquil.id,
          branchCode: savedBranchGuayaquil.code,
          role: 'user',
          permissions: ['reports.view', 'data.view'],
          accessLevel: 'read',
        },
      ],
      roles: [
        {
          id: 'user',
          name: 'Usuario',
          code: 'USER',
          permissions: ['reports.view', 'data.view'],
        },
      ],
      permissions: [
        { code: 'reports.view', name: 'Ver reportes' },
        { code: 'data.view', name: 'Ver datos' },
      ],
      isActive: true,
    });
    const savedTestUser = await usuarioRepository.save(testUser);
    console.log(`✅ Usuario creado: ${savedTestUser.email} (ID: ${savedTestUser.id})`);
    console.log(`   📧 Email: test@mnksolutions.com`);
    console.log(`   🔑 Password: Test123!`);

    // Cerrar conexión
    await AppDataSource.destroy();
    console.log('🎉 Seeding completado exitosamente!');
    console.log('\n📋 Credenciales de Prueba:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('👔 ADMINISTRADOR:');
    console.log('   Email: admin@mnksolutions.com');
    console.log('   Password: Admin123!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('👤 USUARIO DE PRUEBA:');
    console.log('   Email: test@mnksolutions.com');
    console.log('   Password: Test123!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  } catch (error) {
    console.error('❌ Error durante el seeding:', error);
    await AppDataSource.destroy();
    process.exit(1);
  }
}

// Ejecutar seeding
seed();

