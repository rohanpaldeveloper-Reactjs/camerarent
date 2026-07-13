import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Start seeding...');

  // Clean the database
  await prisma.cancellationRequest.deleteMany({});
  await prisma.orderItem.deleteMany({});
  await prisma.order.deleteMany({});
  await prisma.cartItem.deleteMany({});
  await prisma.productAvailabilityBlackout.deleteMany({});
  await prisma.product.deleteMany({});
  await prisma.category.deleteMany({});
  await prisma.vendor.deleteMany({});
  await prisma.user.deleteMany({});

  console.log('Database cleaned.');

  // Create Users
  const adminUser = await prisma.user.create({
    data: {
      email: 'admin@camerarent.com',
      password: 'password123',
      name: 'Super Admin',
      role: 'ADMIN',
      kycStatus: 'APPROVED',
    },
  });

  const customerUser = await prisma.user.create({
    data: {
      email: 'customer@gmail.com',
      password: 'password123',
      name: 'John Doe',
      role: 'CUSTOMER',
      kycStatus: 'APPROVED',
      kycDocUrl: 'https://placehold.co/600x400/png?text=John+Doe+ID+Card',
    },
  });

  const vendorUser1 = await prisma.user.create({
    data: {
      email: 'apex@camerarent.com',
      password: 'password123',
      name: 'Apex Rentals Owner',
      role: 'VENDOR',
      kycStatus: 'APPROVED',
    },
  });

  const vendorUser2 = await prisma.user.create({
    data: {
      email: 'lenslight@camerarent.com',
      password: 'password123',
      name: 'Lens & Light Owner',
      role: 'VENDOR',
      kycStatus: 'APPROVED',
    },
  });

  console.log('Users created.');

  // Create Vendors
  const vendor1 = await prisma.vendor.create({
    data: {
      name: 'Apex Rentals',
      email: 'info@apexrentals.com',
      phone: '+15550101',
      commissionRate: 15.0,
      isActive: true,
      userId: vendorUser1.id,
    },
  });

  const vendor2 = await prisma.vendor.create({
    data: {
      name: 'Lens & Light',
      email: 'contact@lenslight.com',
      phone: '+15550202',
      commissionRate: 12.0,
      isActive: true,
      userId: vendorUser2.id,
    },
  });

  console.log('Vendors created.');

  // Create Categories
  const categoriesData = [
    { name: 'Cameras', slug: 'cameras', description: 'Cinema and DSLR cameras' },
    { name: 'Lenses', slug: 'lenses', description: 'Prime and zoom cinema lenses' },
    { name: 'Lights', slug: 'lights', description: 'Studio and portable production lights' },
    { name: 'Audio', slug: 'audio', description: 'Microphones, recorders, and audio gear' },
    { name: 'Support', slug: 'support', description: 'Tripods, gimbals, and rigs' },
    { name: 'Accessories', slug: 'accessories', description: 'Batteries, memory cards, and cables' },
  ];

  const categoriesMap: { [key: string]: string } = {};
  for (const cat of categoriesData) {
    const createdCat = await prisma.category.create({ data: cat });
    categoriesMap[cat.name] = createdCat.id;
  }

  console.log('Categories created.');

  // Create Products
  const products = [
    {
      name: 'Sony FX3 Cinema Camera',
      slug: 'sony-fx3-cinema-camera',
      description: 'The Sony FX3 Cinema Line camera brings the vision of passionate creators to life. Cinematic expression is matched with reliable performance and streamlined operation to meet the needs of today’s creative community.',
      specs: JSON.stringify({
        sensor: 'Full Frame 12.1MP',
        iso: '80 - 409,600',
        mount: 'Sony E-mount',
        resolution: '4K up to 120p',
        weight: '715g (body only)',
      }),
      dailyRate: 80.0,
      weeklyRate: 400.0,
      depositAmount: 500.0,
      images: 'https://images.unsplash.com/photo-1620662056087-f2533ed89e86?auto=format&fit=crop&w=600&q=80',
      vendorId: vendor1.id,
      categoryId: categoriesMap['Cameras'],
      totalStock: 5,
    },
    {
      name: 'RED Komodo 6K Starter Pack',
      slug: 'red-komodo-6k-starter-pack',
      description: 'RED Digital Cinema KOMODO 6K is a compact and highly capable cinema camera. It features RED’s legendary image quality, color science, and groundbreaking global shutter sensor technology in an incredibly small form factor.',
      specs: JSON.stringify({
        sensor: 'Super35 19.9MP Global Shutter',
        iso: '800 (native)',
        mount: 'Canon RF',
        resolution: '6K at 40fps, 4K at 60fps',
        weight: '950g (body only)',
      }),
      dailyRate: 250.0,
      weeklyRate: 1250.0,
      depositAmount: 1500.0,
      images: 'https://images.unsplash.com/photo-1599839575945-a9e5af0c3fa5?auto=format&fit=crop&w=600&q=80',
      vendorId: vendor1.id,
      categoryId: categoriesMap['Cameras'],
      totalStock: 2,
    },
    {
      name: 'Canon EOS R5 C',
      slug: 'canon-eos-r5c',
      description: 'A true hybrid model, the EOS R5 C is a cine-camera that shares features with the EOS R5 mirrorless camera and Cinema EOS systems. Perfect for solo shooters wanting high-res photos and 8K cinema recording in one body.',
      specs: JSON.stringify({
        sensor: 'Full Frame 45MP',
        iso: '100 - 51,200',
        mount: 'Canon RF',
        resolution: '8K up to 60p, 4K up to 120p',
        weight: '680g (body only)',
      }),
      dailyRate: 120.0,
      weeklyRate: 600.0,
      depositAmount: 800.0,
      images: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=600&q=80',
      vendorId: vendor2.id,
      categoryId: categoriesMap['Cameras'],
      totalStock: 3,
    },
    {
      name: 'Sony FE 24-70mm f/2.8 GM II',
      slug: 'sony-fe-24-70mm-f2-8-gm-ii',
      description: 'The Sony FE 24-70mm f/2.8 GM II is a refined standard zoom lens, offering evolved optical and AF performance in a lightweight, compact design. Ideal for both video and stills.',
      specs: JSON.stringify({
        focalLength: '24-70mm',
        aperture: 'f/2.8 - f/22',
        mount: 'Sony E-mount',
        filterSize: '82mm',
        weight: '695g',
      }),
      dailyRate: 45.0,
      weeklyRate: 220.0,
      depositAmount: 300.0,
      images: 'https://images.unsplash.com/photo-1617005082133-548c4dd27f35?auto=format&fit=crop&w=600&q=80',
      vendorId: vendor1.id,
      categoryId: categoriesMap['Lenses'],
      totalStock: 4,
    },
    {
      name: 'Canon RF 50mm f/1.2L USM',
      slug: 'canon-rf-50mm-f1-2l',
      description: 'Setting new standards of optical quality and speed, the RF 50mm f/1.2L USM prime lens offers supreme sharpness, shallow depth-of-field control, and remarkable low-light performance.',
      specs: JSON.stringify({
        focalLength: '50mm',
        aperture: 'f/1.2 - f/16',
        mount: 'Canon RF',
        filterSize: '95mm',
        weight: '950g',
      }),
      dailyRate: 50.0,
      weeklyRate: 250.0,
      depositAmount: 400.0,
      images: 'https://images.unsplash.com/photo-1616423643764-7e57ba7950c2?auto=format&fit=crop&w=600&q=80',
      vendorId: vendor2.id,
      categoryId: categoriesMap['Lenses'],
      totalStock: 3,
    },
    {
      name: 'Aputure LS 600d Pro',
      slug: 'aputure-ls-600d-pro',
      description: 'The Light Storm 600d Pro is the latest flagship hard light in the Aputure Light Storm COB series. It features a massive 600W COB LED output, making it one of the brightest point-source LEDs on the market.',
      specs: JSON.stringify({
        powerConsumption: '720W Max',
        colorTemp: '5600K ± 200K',
        cri: '≥96',
        mount: 'Bowens Mount',
        weatherproof: 'IP54 Weather Resistant',
      }),
      dailyRate: 65.0,
      weeklyRate: 320.0,
      depositAmount: 400.0,
      images: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=600&q=80',
      vendorId: vendor2.id,
      categoryId: categoriesMap['Lights'],
      totalStock: 2,
    },
    {
      name: 'Sennheiser MKH416 Shotgun Microphone',
      slug: 'sennheiser-mkh416',
      description: 'The MKH 416 is a compact RF condenser microphone. Excellent directivity and compact design, high consonant clarity and feedback rejection are ideal qualities for film, radio and television.',
      specs: JSON.stringify({
        polarPattern: 'Supercardioid / Lobar',
        freqResponse: '40Hz - 20kHz',
        connector: 'XLR-3',
        weight: '175g',
      }),
      dailyRate: 30.0,
      weeklyRate: 150.0,
      depositAmount: 200.0,
      images: 'https://images.unsplash.com/photo-1590602847861-f357a9332bbc?auto=format&fit=crop&w=600&q=80',
      vendorId: vendor1.id,
      categoryId: categoriesMap['Audio'],
      totalStock: 6,
    },
    {
      name: 'Sachtler Flowtech 75 Tripod System',
      slug: 'sachtler-flowtech-75',
      description: 'The Sachtler System FSB 4 Flowtech 75 carbon fiber tripod system offers carbon fiber legs that release and adjust in an instant, with a premium fluid head for camera setups up to 4kg.',
      specs: JSON.stringify({
        payload: '0 - 4kg',
        material: 'Carbon Fiber',
        heightRange: '26cm - 153cm',
        headType: 'FSB 4 Fluid Head',
        weight: '4.8kg',
      }),
      dailyRate: 40.0,
      weeklyRate: 200.0,
      depositAmount: 300.0,
      images: 'https://images.unsplash.com/photo-1495707902641-75cac588d2e9?auto=format&fit=crop&w=600&q=80',
      vendorId: vendor1.id,
      categoryId: categoriesMap['Support'],
      totalStock: 4,
    },
  ];

  for (const product of products) {
    await prisma.product.create({ data: product });
  }

  console.log('Products created.');
  console.log('Seeding finished successfully.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
