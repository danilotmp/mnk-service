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
      console.log('⚠️  Ya existen datos de prueba. Actualizando permisos y menú de seguridad...');
      
      // Buscar y actualizar permisos de seguridad si no existen
      let securityAllPerm = await permissionRepository.findOne({ where: { code: 'security.*' } });
      if (!securityAllPerm) {
        console.log('🔐 Creando permisos de seguridad...');
        const securityPermissionsToCreate = [
          { code: 'security.*', name: 'Acceso completo al módulo de seguridad', resource: 'security', action: '*' },
          { code: 'security.users.view', name: 'Ver usuarios (seguridad)', resource: 'security', action: 'users.view' },
          { code: 'security.roles.view', name: 'Ver roles (seguridad)', resource: 'security', action: 'roles.view' },
          { code: 'security.permissions.view', name: 'Ver permisos (seguridad)', resource: 'security', action: 'permissions.view' },
          { code: 'security.accesses.view', name: 'Ver accesos (seguridad)', resource: 'security', action: 'accesses.view' },
        ];
        
        for (const perm of securityPermissionsToCreate) {
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
          await permissionRepository.save(permission);
        }
        
        // Asignar permisos de seguridad al rol admin
        const adminRole = await roleRepository.findOne({ where: { name: 'admin' } });
        if (adminRole) {
          const allPermissions = await permissionRepository.find({ where: { isActive: true } });
          for (const permission of allPermissions) {
            const existing = await rolePermissionRepository.findOne({ 
              where: { roleId: adminRole.id, permissionId: permission.id } 
            });
            if (!existing) {
              const rolePermission = rolePermissionRepository.create({
                roleId: adminRole.id,
                permissionId: permission.id,
                isActive: true,
              });
              await rolePermissionRepository.save(rolePermission);
            }
          }
        }
      }
      
      // Buscar y actualizar menú de seguridad si no existe
      let securityMenu = await menuItemRepository.findOne({ where: { menuId: 'security' } });
      if (!securityMenu) {
        console.log('📋 Creando menú de seguridad...');
        securityAllPerm = await permissionRepository.findOne({ where: { code: 'security.*' } });
        const securityUsersPerm = await permissionRepository.findOne({ where: { code: 'security.users.view' } });
        const securityRolesPerm = await permissionRepository.findOne({ where: { code: 'security.roles.view' } });
        const securityPermissionsPerm = await permissionRepository.findOne({ where: { code: 'security.permissions.view' } });
        const securityAccessesPerm = await permissionRepository.findOne({ where: { code: 'security.accesses.view' } });
        
        securityMenu = menuItemRepository.create({
          menuId: 'security',
          label: 'Seguridades',
          route: '/security',
          order: 100,
          isPublic: false,
          permissionId: securityAllPerm?.id,
          description: 'Módulo de administración de seguridad',
          submenu: [
            {
              id: 'security-users',
              label: 'Usuarios',
              route: '/security/users',
              description: 'Administración de usuarios del sistema',
              order: 1,
            },
            {
              id: 'security-roles',
              label: 'Roles',
              route: '/security/roles',
              description: 'Administración de roles del sistema',
              order: 2,
            },
            {
              id: 'security-permissions',
              label: 'Permisos',
              route: '/security/permissions',
              description: 'Administración de permisos del sistema',
              order: 3,
            },
            {
              id: 'security-accesses',
              label: 'Accesos',
              route: '/security/accesses',
              description: 'Administración de accesos de usuarios',
              order: 4,
            },
          ],
          isActive: true,
        });
        await menuItemRepository.save(securityMenu);
        console.log('✅ Menú de seguridad creado');
      }
      
      console.log('✅ Actualización completada');
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
      // Seguridad (Security Module)
      { code: 'security.*', name: 'Acceso completo al módulo de seguridad', resource: 'security', action: '*' },
      { code: 'security.users.view', name: 'Ver usuarios (seguridad)', resource: 'security', action: 'users.view' },
      { code: 'security.roles.view', name: 'Ver roles (seguridad)', resource: 'security', action: 'roles.view' },
      { code: 'security.permissions.view', name: 'Ver permisos (seguridad)', resource: 'security', action: 'permissions.view' },
      { code: 'security.accesses.view', name: 'Ver accesos (seguridad)', resource: 'security', action: 'accesses.view' },
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

    // Guardar permisos de seguridad para el menú
    const securityPermissions = {
      all: savedActionPermissions.find((p) => p.code === 'security.*'),
      usersView: savedActionPermissions.find((p) => p.code === 'security.users.view'),
      rolesView: savedActionPermissions.find((p) => p.code === 'security.roles.view'),
      permissionsView: savedActionPermissions.find((p) => p.code === 'security.permissions.view'),
      accessesView: savedActionPermissions.find((p) => p.code === 'security.accesses.view'),
    };

    // Crear menú de seguridad (administración)
    console.log('🔒 Creando menú de seguridad (administración)...');

    // Menú principal de seguridad
    const securityMenuItem = menuItemRepository.create({
      menuId: 'security',
      label: 'Seguridades',
      route: '/security',
      order: 100,
      isPublic: false,
      permissionId: securityPermissions.all?.id,
      description: 'Módulo de administración de seguridad',
      isActive: true,
    });
    const savedSecurityMenu = await menuItemRepository.save(securityMenuItem);
    console.log(`✅ Menú principal de seguridad creado: ${savedSecurityMenu.label}`);

    // Submenús de seguridad
    const securitySubmenus = [
      {
        menuId: 'security-users',
        label: 'Usuarios',
        route: '/security/users',
        order: 1,
        description: 'Administración de usuarios del sistema',
        permissionId: securityPermissions.usersView?.id,
      },
      {
        menuId: 'security-roles',
        label: 'Roles',
        route: '/security/roles',
        order: 2,
        description: 'Administración de roles del sistema',
        permissionId: securityPermissions.rolesView?.id,
      },
      {
        menuId: 'security-permissions',
        label: 'Permisos',
        route: '/security/permissions',
        order: 3,
        description: 'Administración de permisos del sistema',
        permissionId: securityPermissions.permissionsView?.id,
      },
      {
        menuId: 'security-accesses',
        label: 'Accesos',
        route: '/security/accesses',
        order: 4,
        description: 'Administración de accesos de usuarios',
        permissionId: securityPermissions.accessesView?.id,
      },
    ];

    // Guardar submenús en el campo submenu del menú principal
    savedSecurityMenu.submenu = securitySubmenus.map((submenu) => ({
      id: submenu.menuId,
      label: submenu.label,
      route: submenu.route,
      description: submenu.description,
      order: submenu.order,
    }));

    await menuItemRepository.save(savedSecurityMenu);
    console.log(`✅ ${securitySubmenus.length} submenús de seguridad creados`);

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

    // Guardar menú de seguridad después de los items principales
    await menuItemRepository.save(savedSecurityMenu);
    console.log(`✅ ${securitySubmenus.length} submenús de seguridad creados`);

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
