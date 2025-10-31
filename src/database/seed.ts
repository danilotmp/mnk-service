import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { CompanyEntity } from '../domains/seguridades/infrastructure/entities/company.entity';
import { BranchEntity } from '../domains/seguridades/infrastructure/entities/branch.entity';
import { UsuarioEntity } from '../domains/seguridades/infrastructure/entities/usuario.entity';
import { RoleEntity } from '../domains/seguridades/infrastructure/entities/role.entity';
import { PermissionEntity, PermissionType } from '../domains/seguridades/infrastructure/entities/permission.entity';
import { UserRoleEntity } from '../domains/seguridades/infrastructure/entities/user-role.entity';
import { RolePermissionEntity } from '../domains/seguridades/infrastructure/entities/role-permission.entity';
import { MenuItemEntity } from '../domains/seguridades/infrastructure/entities/menu-item.entity';

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
    const roleRepository = AppDataSource.getRepository(RoleEntity);
    const permissionRepository = AppDataSource.getRepository(PermissionEntity);
    const userRoleRepository = AppDataSource.getRepository(UserRoleEntity);
    const rolePermissionRepository = AppDataSource.getRepository(RolePermissionEntity);
    const menuItemRepository = AppDataSource.getRepository(MenuItemEntity);

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

    // 3. Crear Permisos
    console.log('🔐 Creando permisos...');

    // Permisos de Página (PAGE)
    const pagePermissions = [
      { code: 'home', name: 'Inicio', route: '/', menuId: 'home', isPublic: true },
      { code: 'explore', name: 'Explorar', route: '/main/explore', menuId: 'explore', isPublic: false },
      { code: 'products', name: 'Productos', route: '/products', menuId: 'products', isPublic: false },
      { code: 'accounts', name: 'Cuentas', route: '/accounts', menuId: 'accounts', isPublic: false },
      { code: 'loans', name: 'Préstamos', route: '/loans', menuId: 'loans', isPublic: false },
      { code: 'cards', name: 'Tarjetas', route: '/cards', menuId: 'cards', isPublic: false },
      { code: 'services', name: 'Más Servicios', route: '/services', menuId: 'services', isPublic: false },
      { code: 'contact', name: 'Contacto', route: '/main/contact', menuId: 'contact', isPublic: true },
    ];

    const savedPagePermissions: PermissionEntity[] = [];
    for (const perm of pagePermissions) {
      const permission = permissionRepository.create({
        code: perm.code,
        name: perm.name,
        type: PermissionType.PAGE,
        resource: perm.code,
        route: perm.route,
        menuId: perm.menuId,
        isPublic: perm.isPublic,
        isActive: true,
        isSystem: true,
      });
      const saved = await permissionRepository.save(permission);
      savedPagePermissions.push(saved);
    }
    console.log(`✅ ${savedPagePermissions.length} permisos de página creados`);

    // Permisos de Acción (ACTION)
    const actionPermissions = [
      // Usuarios
      { code: 'users.view', name: 'Ver usuarios', resource: 'users', action: 'view' },
      { code: 'users.create', name: 'Crear usuarios', resource: 'users', action: 'create' },
      { code: 'users.edit', name: 'Editar usuarios', resource: 'users', action: 'edit' },
      { code: 'users.delete', name: 'Eliminar usuarios', resource: 'users', action: 'delete' },
      // Roles
      { code: 'roles.view', name: 'Ver roles', resource: 'roles', action: 'view' },
      { code: 'roles.create', name: 'Crear roles', resource: 'roles', action: 'create' },
      { code: 'roles.edit', name: 'Editar roles', resource: 'roles', action: 'edit' },
      { code: 'roles.delete', name: 'Eliminar roles', resource: 'roles', action: 'delete' },
      // Permisos
      { code: 'permissions.view', name: 'Ver permisos', resource: 'permissions', action: 'view' },
      { code: 'permissions.manage', name: 'Gestionar permisos', resource: 'permissions', action: 'manage' },
    ];

    const savedActionPermissions: PermissionEntity[] = [];
    for (const perm of actionPermissions) {
      const permission = permissionRepository.create({
        code: perm.code,
        name: perm.name,
        type: PermissionType.ACTION,
        resource: perm.resource,
        action: perm.action,
        isPublic: false,
        isActive: true,
        isSystem: true,
      });
      const saved = await permissionRepository.save(permission);
      savedActionPermissions.push(saved);
    }
    console.log(`✅ ${savedActionPermissions.length} permisos de acción creados`);

    // 4. Crear Roles
    console.log('👥 Creando roles...');

    // Rol Admin
    const adminRole = roleRepository.create({
      companyId: savedCompany.id,
      name: 'admin',
      displayName: 'Administrador',
      description: 'Rol de administrador con todos los permisos',
      isActive: true,
      isSystem: true,
    });
    const savedAdminRole = await roleRepository.save(adminRole);
    console.log(`✅ Rol creado: ${savedAdminRole.displayName}`);

    // Asignar todos los permisos al rol admin
    for (const permission of [...savedPagePermissions, ...savedActionPermissions]) {
      const rolePermission = rolePermissionRepository.create({
        roleId: savedAdminRole.id,
        permissionId: permission.id,
        isActive: true,
      });
      await rolePermissionRepository.save(rolePermission);
    }

    // Rol Usuario
    const userRole = roleRepository.create({
      companyId: savedCompany.id,
      name: 'usuario',
      displayName: 'Usuario',
      description: 'Rol de usuario básico',
      isActive: true,
      isSystem: true,
    });
    const savedUserRole = await roleRepository.save(userRole);
    console.log(`✅ Rol creado: ${savedUserRole.displayName}`);

    // Asignar permisos básicos al rol usuario (solo lectura)
    const userPermissions = [
      'home',
      'explore',
      'products',
      'accounts',
      'loans',
      'cards',
      'services',
      'contact',
      'users.view',
    ];
    for (const permCode of userPermissions) {
      const permission = [...savedPagePermissions, ...savedActionPermissions].find((p) => p.code === permCode);
      if (permission) {
        const rolePermission = rolePermissionRepository.create({
          roleId: savedUserRole.id,
          permissionId: permission.id,
          isActive: true,
        });
        await rolePermissionRepository.save(rolePermission);
      }
    }

    // 5. Crear Usuarios
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
        },
        {
          branchId: savedBranchGuayaquil.id,
          branchCode: savedBranchGuayaquil.code,
        },
      ],
      isActive: true,
    });
    const savedAdminUser = await usuarioRepository.save(adminUser);
    console.log(`✅ Usuario creado: ${savedAdminUser.email} (ID: ${savedAdminUser.id})`);

    // Asignar rol admin al usuario admin
    const adminUserRole = userRoleRepository.create({
      userId: savedAdminUser.id,
      roleId: savedAdminRole.id,
      isActive: true,
    });
    await userRoleRepository.save(adminUserRole);

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
        },
      ],
      isActive: true,
    });
    const savedTestUser = await usuarioRepository.save(testUser);
    console.log(`✅ Usuario creado: ${savedTestUser.email} (ID: ${savedTestUser.id})`);

    // Asignar rol usuario al usuario de prueba
    const testUserRole = userRoleRepository.create({
      userId: savedTestUser.id,
      roleId: savedUserRole.id,
      isActive: true,
    });
    await userRoleRepository.save(testUserRole);

    // 6. Crear Items del Menú
    console.log('📋 Creando items del menú...');

    const menuItems = [
      {
        menuId: 'home',
        label: 'Inicio',
        route: '/',
        order: 1,
        isPublic: true,
        permissionId: savedPagePermissions.find((p) => p.code === 'home')?.id,
      },
      {
        menuId: 'explore',
        label: 'Explorar',
        route: '/main/explore',
        order: 2,
        isPublic: false,
        permissionId: savedPagePermissions.find((p) => p.code === 'explore')?.id,
      },
      {
        menuId: 'products',
        label: 'Productos',
        order: 3,
        isPublic: false,
        permissionId: savedPagePermissions.find((p) => p.code === 'products')?.id,
        columns: [
          {
            title: 'Productos',
            items: [
              { id: 'network-security', label: 'Network Security', route: '/products/network-security' },
              { id: 'vulnerability', label: 'Vulnerability', route: '/products/vulnerability' },
              { id: 'pam', label: 'PAM', route: '/products/pam' },
              { id: 'endpoint', label: 'Endpoint', route: '/products/endpoint' },
              { id: 'insurance', label: 'Insurance', route: '/products/insurance' },
            ],
          },
          {
            title: 'Plataforma',
            items: [
              { id: 'threat-hunting', label: 'Threat Hunting', route: '/platform/threat-hunting' },
              { id: 'uem', label: 'UEM', route: '/platform/uem' },
              { id: 'email-security', label: 'Email Security', route: '/platform/email-security' },
            ],
          },
          {
            title: 'Servicios Administrados',
            items: [
              { id: 'xdr', label: 'XDR', route: '/services/xdr' },
              { id: 'mxdr', label: 'MXDR', route: '/services/mxdr' },
            ],
          },
        ],
      },
      {
        menuId: 'accounts',
        label: 'Cuentas',
        route: '/accounts',
        order: 4,
        isPublic: false,
        permissionId: savedPagePermissions.find((p) => p.code === 'accounts')?.id,
        submenu: [
          { id: 'savings', label: 'Ahorros', route: '/accounts/savings' },
          { id: 'checking', label: 'Corriente', route: '/accounts/checking' },
          { id: 'investments', label: 'Inversiones', route: '/accounts/investments' },
        ],
      },
      {
        menuId: 'loans',
        label: 'Préstamos',
        route: '/loans',
        order: 5,
        isPublic: false,
        permissionId: savedPagePermissions.find((p) => p.code === 'loans')?.id,
        submenu: [
          { id: 'multicredit', label: 'Multicrédito', description: 'Préstamo multicrédito', route: '/loans/multicredit' },
          { id: 'microcredit', label: 'Microcrédito', description: 'Préstamo microcrédito', route: '/loans/microcredit' },
          { id: 'casafacil', label: 'Casa Fácil', description: 'Préstamo para vivienda', route: '/loans/casafacil' },
          { id: 'autofacil', label: 'Auto Fácil', description: 'Préstamo para vehículo', route: '/loans/autofacil' },
          { id: 'educativo', label: 'Educativo', description: 'Préstamo educativo', route: '/loans/educativo' },
        ],
      },
      {
        menuId: 'cards',
        label: 'Tarjetas',
        route: '/cards',
        order: 6,
        isPublic: false,
        permissionId: savedPagePermissions.find((p) => p.code === 'cards')?.id,
        submenu: [
          { id: 'visa', label: 'Visa', route: '/cards/visa' },
          { id: 'mastercard', label: 'Mastercard', route: '/cards/mastercard' },
        ],
      },
      {
        menuId: 'services',
        label: 'Más Servicios',
        route: '/services',
        order: 7,
        isPublic: false,
        permissionId: savedPagePermissions.find((p) => p.code === 'services')?.id,
        submenu: [
          { id: 'transfers', label: 'Transferencias', route: '/services/transfers' },
          { id: 'payments', label: 'Pagos', route: '/services/payments' },
        ],
      },
      {
        menuId: 'contact',
        label: 'Contacto',
        route: '/main/contact',
        order: 8,
        isPublic: true,
        permissionId: savedPagePermissions.find((p) => p.code === 'contact')?.id,
      },
    ];

    for (const item of menuItems) {
      const menuItem = menuItemRepository.create({
        menuId: item.menuId,
        label: item.label,
        route: item.route,
        order: item.order,
        isPublic: item.isPublic || false,
        permissionId: item.permissionId,
        columns: item.columns || null,
        submenu: item.submenu || null,
        isActive: true,
      });
      await menuItemRepository.save(menuItem);
    }
    console.log(`✅ ${menuItems.length} items del menú creados`);

    // Cerrar conexión
    await AppDataSource.destroy();
    console.log('🎉 Seeding completado exitosamente!');
    console.log('\n📋 Credenciales de Prueba:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('👔 ADMINISTRADOR:');
    console.log('   Email: admin@mnksolutions.com');
    console.log('   Password: Admin123!');
    console.log('   Permisos: Todos los permisos');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('👤 USUARIO DE PRUEBA:');
    console.log('   Email: test@mnksolutions.com');
    console.log('   Password: Test123!');
    console.log('   Permisos: Acceso básico (solo lectura)');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  } catch (error) {
    console.error('❌ Error durante el seeding:', error);
    await AppDataSource.destroy();
    process.exit(1);
  }
}

// Ejecutar seeding
seed();
