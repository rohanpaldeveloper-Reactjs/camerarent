import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

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

  const hashedPassword = bcrypt.hashSync('password123', 10);

  // Create Users
  const adminUser = await prisma.user.create({
    data: {
      email: 'admin@camerarent.com',
      password: hashedPassword,
      name: 'Super Admin',
      role: 'ADMIN',
      kycStatus: 'APPROVED',
    },
  });

  const customerUser = await prisma.user.create({
    data: {
      email: 'customer@gmail.com',
      password: hashedPassword,
      name: 'John Doe',
      role: 'CUSTOMER',
      kycStatus: 'APPROVED',
      kycDocUrl: 'https://placehold.co/600x400/png?text=John+Doe+ID+Card',
    },
  });

  const vendorUser1 = await prisma.user.create({
    data: {
      email: 'apex@camerarent.com',
      password: hashedPassword,
      name: 'Apex Rentals Owner',
      role: 'VENDOR',
      kycStatus: 'APPROVED',
    },
  });

  const vendorUser2 = await prisma.user.create({
    data: {
      email: 'lenslight@camerarent.com',
      password: hashedPassword,
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
    // === CAMERAS ===
    // Mirrorless Camera
    {
      name: 'Canon EOS R5',
      slug: 'canon-eos-r5',
      description: 'The Canon EOS R5 features a newly developed 45MP CMOS sensor, which offers 8K raw video recording, 12 fps continuous shooting with a mechanical shutter, and is the first EOS camera to feature 5-axis sensor-shift image stabilization.',
      specs: JSON.stringify({ sensor: 'Full Frame 45MP', mount: 'Canon RF', resolution: '8K up to 30p', weight: '738g' }),
      dailyRate: 2500.0,
      weeklyRate: 15000.0,
      depositAmount: 12000.0,
      images: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=600&q=80',
      vendorId: vendor1.id,
      categoryId: categoriesMap['Cameras'],
      subcategory: 'Mirrorless Camera',
      totalStock: 3,
    },
    {
      name: 'Canon EOS R6',
      slug: 'canon-eos-r6',
      description: 'The Canon EOS R6 is a versatile tool to meet the photo and video requirements of a contemporary imaging workflow. This full-frame mirrorless camera revolves around a refined 20MP CMOS sensor.',
      specs: JSON.stringify({ sensor: 'Full Frame 20MP', mount: 'Canon RF', resolution: '4K up to 60p', weight: '680g' }),
      dailyRate: 1500.0,
      weeklyRate: 9000.0,
      depositAmount: 8000.0,
      images: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=600&q=80',
      vendorId: vendor1.id,
      categoryId: categoriesMap['Cameras'],
      subcategory: 'Mirrorless Camera',
      totalStock: 4,
    },
    {
      name: 'Sony A7 IV',
      slug: 'sony-a7-iv',
      description: 'The Sony A7 IV is the ideal hybrid, with a 33MP Exmor R CMOS sensor, high-speed autofocus, and advanced 4K 60p video capabilities.',
      specs: JSON.stringify({ sensor: 'Full Frame 33MP', mount: 'Sony E-mount', resolution: '4K up to 60p', weight: '658g' }),
      dailyRate: 2000.0,
      weeklyRate: 12000.0,
      depositAmount: 10000.0,
      images: 'https://images.unsplash.com/photo-1620662056087-f2533ed89e86?auto=format&fit=crop&w=600&q=80',
      vendorId: vendor2.id,
      categoryId: categoriesMap['Cameras'],
      subcategory: 'Mirrorless Camera',
      totalStock: 3,
    },
    {
      name: 'Fujifilm X-T5',
      slug: 'fujifilm-x-t5',
      description: 'A photography-focused mirrorless camera featuring a 40MP APS-C X-Trans BSI CMOS sensor and classic dial-based controls.',
      specs: JSON.stringify({ sensor: 'APS-C 40MP', mount: 'Fujifilm X', resolution: '6.2K up to 30p', weight: '557g' }),
      dailyRate: 1600.0,
      weeklyRate: 9600.0,
      depositAmount: 7000.0,
      images: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=600&q=80',
      vendorId: vendor2.id,
      categoryId: categoriesMap['Cameras'],
      subcategory: 'Mirrorless Camera',
      totalStock: 2,
    },
    // Cinema Camera
    {
      name: 'Blackmagic Pocket Cinema Camera 6K Pro',
      slug: 'blackmagic-pocket-6k-pro',
      description: 'The Blackmagic Pocket Cinema Camera 6K Pro is a technology-packed, handheld 6K digital film camera with high dynamic range and EF lens mount.',
      specs: JSON.stringify({ sensor: 'Super35 HDR', mount: 'EF Mount', resolution: '6K up to 50fps', weight: '1238g' }),
      dailyRate: 3000.0,
      weeklyRate: 18000.0,
      depositAmount: 15000.0,
      images: 'https://images.unsplash.com/photo-1599839575945-a9e5af0c3fa5?auto=format&fit=crop&w=600&q=80',
      vendorId: vendor1.id,
      categoryId: categoriesMap['Cameras'],
      subcategory: 'Cinema Camera',
      totalStock: 3,
    },
    {
      name: 'RED Komodo 6K Starter Pack',
      slug: 'red-komodo-6k',
      description: 'RED KOMODO 6K features legendary image quality, color science, and global shutter sensor technology in a tiny form factor.',
      specs: JSON.stringify({ sensor: 'Super35 Global Shutter', mount: 'Canon RF', resolution: '6K at 40fps', weight: '950g' }),
      dailyRate: 8000.0,
      weeklyRate: 48000.0,
      depositAmount: 40000.0,
      images: 'https://images.unsplash.com/photo-1599839575945-a9e5af0c3fa5?auto=format&fit=crop&w=600&q=80',
      vendorId: vendor1.id,
      categoryId: categoriesMap['Cameras'],
      subcategory: 'Cinema Camera',
      totalStock: 2,
    },
    {
      name: 'Sony FX3 Cinema Camera',
      slug: 'sony-fx3',
      description: 'The Sony FX3 Cinema Line camera brings cinematic expression to life with reliable performance and compact operation.',
      specs: JSON.stringify({ sensor: 'Full Frame 12.1MP', mount: 'Sony E-mount', resolution: '4K up to 120p', weight: '715g' }),
      dailyRate: 3500.0,
      weeklyRate: 21000.0,
      depositAmount: 18000.0,
      images: 'https://images.unsplash.com/photo-1620662056087-f2533ed89e86?auto=format&fit=crop&w=600&q=80',
      vendorId: vendor2.id,
      categoryId: categoriesMap['Cameras'],
      subcategory: 'Cinema Camera',
      totalStock: 4,
    },
    {
      name: 'Canon EOS C70',
      slug: 'canon-eos-c70',
      description: 'The EOS C70 is a next-generation RF Mount Cinema EOS camera featuring a Super35 DGO sensor and compact form factor.',
      specs: JSON.stringify({ sensor: 'Super35 DGO', mount: 'Canon RF', resolution: '4K up to 120p', weight: '1170g' }),
      dailyRate: 4000.0,
      weeklyRate: 24000.0,
      depositAmount: 20000.0,
      images: 'https://images.unsplash.com/photo-1599839575945-a9e5af0c3fa5?auto=format&fit=crop&w=600&q=80',
      vendorId: vendor2.id,
      categoryId: categoriesMap['Cameras'],
      subcategory: 'Cinema Camera',
      totalStock: 2,
    },
    // Drone Camera
    {
      name: 'DJI Air 3S',
      slug: 'dji-air-3s',
      description: 'A dual-camera travel drone featuring a 1-inch CMOS primary camera, medium tele camera, and advanced safety/tracking systems.',
      specs: JSON.stringify({ sensor: '1-inch & 1/1.3-inch CMOS', resolution: '4K/60p HDR', range: '20km', weight: '725g' }),
      dailyRate: 3000.0,
      weeklyRate: 18000.0,
      depositAmount: 10000.0,
      images: 'https://images.unsplash.com/photo-1508614589041-895b88991e3e?auto=format&fit=crop&w=600&q=80',
      vendorId: vendor1.id,
      categoryId: categoriesMap['Cameras'],
      subcategory: 'Drone Camera',
      totalStock: 3,
    },
    {
      name: 'DJI Inspire 3',
      slug: 'dji-inspire-3',
      description: 'A professional full-frame 8K cinema drone designed for top-tier cinematography, featuring dual-control support and RTK positioning.',
      specs: JSON.stringify({ sensor: 'Full Frame Zenmuse X9-8K Air', speed: '94km/h', resolution: '8K up to 75fps', flightTime: '28 min' }),
      dailyRate: 50000.0,
      weeklyRate: 300000.0,
      depositAmount: 150000.0,
      images: 'https://images.unsplash.com/photo-1508614589041-895b88991e3e?auto=format&fit=crop&w=600&q=80',
      vendorId: vendor1.id,
      categoryId: categoriesMap['Cameras'],
      subcategory: 'Drone Camera',
      totalStock: 1,
    },
    {
      name: 'DJI Mavic 2 Pro',
      slug: 'dji-mavic-2-pro',
      description: 'The DJI Mavic 2 Pro features a 1-inch Hasselblad sensor for stunning high-quality aerial photography.',
      specs: JSON.stringify({ sensor: '1-inch CMOS Hasselblad', resolution: '4K/30p', flightTime: '31 min' }),
      dailyRate: 2500.0,
      weeklyRate: 15000.0,
      depositAmount: 8000.0,
      images: 'https://images.unsplash.com/photo-1508614589041-895b88991e3e?auto=format&fit=crop&w=600&q=80',
      vendorId: vendor1.id,
      categoryId: categoriesMap['Cameras'],
      subcategory: 'Drone Camera',
      totalStock: 2,
    },
    {
      name: 'DJI Mavic 3 Classic',
      slug: 'dji-mavic-3-classic',
      description: 'Featuring a 4/3 CMOS Hasselblad camera, the Mavic 3 Classic delivers professional-grade imaging with maximum ease of flight.',
      specs: JSON.stringify({ sensor: '4/3 CMOS Hasselblad', resolution: '5.1K/50p, 4K/120p', weight: '895g', flightTime: '46 min' }),
      dailyRate: 4000.0,
      weeklyRate: 24000.0,
      depositAmount: 12000.0,
      images: 'https://images.unsplash.com/photo-1508614589041-895b88991e3e?auto=format&fit=crop&w=600&q=80',
      vendorId: vendor2.id,
      categoryId: categoriesMap['Cameras'],
      subcategory: 'Drone Camera',
      totalStock: 4,
    },
    {
      name: 'DJI Mavic 3 Pro',
      slug: 'dji-mavic-3-pro',
      description: 'The DJI Mavic 3 Pro features a triple-camera system including a Hasselblad camera and dual tele cameras, setting a new standard for flight photography.',
      specs: JSON.stringify({ sensor: '4/3 CMOS Hasselblad & Dual Tele', range: '15km', flightTime: '43 min', weight: '958g' }),
      dailyRate: 4500.0,
      weeklyRate: 27000.0,
      depositAmount: 15000.0,
      images: 'https://images.unsplash.com/photo-1508614589041-895b88991e3e?auto=format&fit=crop&w=600&q=80',
      vendorId: vendor2.id,
      categoryId: categoriesMap['Cameras'],
      subcategory: 'Drone Camera',
      totalStock: 3,
    },
    {
      name: 'DJI Mavic 3 Pro Cine',
      slug: 'dji-mavic-3-pro-cine',
      description: 'The Cine version supports Apple ProRes encoding on all three cameras and features a built-in 1TB SSD.',
      specs: JSON.stringify({ sensor: '4/3 CMOS Hasselblad & ProRes support', storage: '1TB SSD built-in', weight: '963g' }),
      dailyRate: 7000.0,
      weeklyRate: 42000.0,
      depositAmount: 20000.0,
      images: 'https://images.unsplash.com/photo-1508614589041-895b88991e3e?auto=format&fit=crop&w=600&q=80',
      vendorId: vendor2.id,
      categoryId: categoriesMap['Cameras'],
      subcategory: 'Drone Camera',
      totalStock: 2,
    },
    // Action Camera
    {
      name: 'GoPro HERO12 Black',
      slug: 'gopro-hero12-black',
      description: 'The HERO12 Black takes GoPro’s best-in-class image quality to the next level with HDR video, improved battery efficiency, and HyperSmooth 6.0 stabilization.',
      specs: JSON.stringify({ sensor: '1/1.9-inch CMOS', resolution: '5.3K at 60fps', weight: '154g', features: 'Waterproof up to 10m' }),
      dailyRate: 800.0,
      weeklyRate: 4800.0,
      depositAmount: 3000.0,
      images: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=600&q=80',
      vendorId: vendor1.id,
      categoryId: categoriesMap['Cameras'],
      subcategory: 'Action Camera',
      totalStock: 10,
    },
    {
      name: 'DJI Osmo Action 4',
      slug: 'dji-osmo-action-4',
      description: 'Capture the raw excitement of any moment with striking image quality and unmatched flexibility, even in low light.',
      specs: JSON.stringify({ sensor: '1/1.3-inch CMOS', resolution: '4K/120p', features: 'Dual Touchscreens, Waterproof 18m', weight: '145g' }),
      dailyRate: 700.0,
      weeklyRate: 4200.0,
      depositAmount: 2500.0,
      images: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=600&q=80',
      vendorId: vendor2.id,
      categoryId: categoriesMap['Cameras'],
      subcategory: 'Action Camera',
      totalStock: 6,
    },
    {
      name: 'GoPro Max 360',
      slug: 'gopro-max-360',
      description: 'Maximize your creative freedom. With MAX you can shoot traditional HERO-style video and photos or immersive 360 footage.',
      specs: JSON.stringify({ resolution: '5.6K 360-degree video', audio: '6-mic directional audio', stabilization: 'Max HyperSmooth', weight: '163g' }),
      dailyRate: 1000.0,
      weeklyRate: 6000.0,
      depositAmount: 4000.0,
      images: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=600&q=80',
      vendorId: vendor1.id,
      categoryId: categoriesMap['Cameras'],
      subcategory: 'Action Camera',
      totalStock: 4,
    },
    {
      name: 'Insta360 X4',
      slug: 'insta360-x4',
      description: 'Incredible 8K 360-degree capture makes the Insta360 X4 the ultimate action camera for creators wishing to reframe after the shoot.',
      specs: JSON.stringify({ resolution: '8K 360 video, 4K 120fps', stabilization: 'FlowState', screen: '2.29-inch touchscreen', weight: '203g' }),
      dailyRate: 1200.0,
      weeklyRate: 7200.0,
      depositAmount: 5000.0,
      images: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=600&q=80',
      vendorId: vendor2.id,
      categoryId: categoriesMap['Cameras'],
      subcategory: 'Action Camera',
      totalStock: 5,
    },

    // === LIGHTS ===
    // Continuous Lights
    {
      name: 'Aputure LS 600d Pro',
      slug: 'aputure-ls-600d-pro',
      description: 'A powerful point-source LED light with IP54 weather resistance and Bowens mount capability.',
      specs: JSON.stringify({ power: '600W COB LED', colorTemp: '5600K', cri: '96', mount: 'Bowens' }),
      dailyRate: 2500.0,
      weeklyRate: 15000.0,
      depositAmount: 15000.0,
      images: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=600&q=80',
      vendorId: vendor2.id,
      categoryId: categoriesMap['Lights'],
      subcategory: 'Continuous Lights',
      totalStock: 3,
    },
    {
      name: 'Amaran 200d',
      slug: 'amaran-200d',
      description: 'Compact and lightweight daylight-balanced point-source LED light perfect for creators and interview setups.',
      specs: JSON.stringify({ power: '200W', colorTemp: '5600K', dimming: '0-100%', weight: '1.57kg' }),
      dailyRate: 800.0,
      weeklyRate: 4800.0,
      depositAmount: 4000.0,
      images: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=600&q=80',
      vendorId: vendor2.id,
      categoryId: categoriesMap['Lights'],
      subcategory: 'Continuous Lights',
      totalStock: 5,
    },
    {
      name: 'Godox SL150 II',
      slug: 'godox-sl150-ii',
      description: 'A daylight-balanced 150W LED monolite-style light source suitable for video and studio broadcasts.',
      specs: JSON.stringify({ power: '150W', colorTemp: '5600K', cri: '96', fan: 'Silent Mode' }),
      dailyRate: 600.0,
      weeklyRate: 3600.0,
      depositAmount: 3000.0,
      images: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=600&q=80',
      vendorId: vendor1.id,
      categoryId: categoriesMap['Lights'],
      subcategory: 'Continuous Lights',
      totalStock: 6,
    },
    {
      name: 'Nanlite Forza 500',
      slug: 'nanlite-forza-500',
      description: 'The Forza 500 LED from Nanlite is a monolight style light fixture with remarkable light output.',
      specs: JSON.stringify({ power: '500W', colorTemp: '5600K', cri: '98', weight: '2.5kg' }),
      dailyRate: 2200.0,
      weeklyRate: 13200.0,
      depositAmount: 12000.0,
      images: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=600&q=80',
      vendorId: vendor2.id,
      categoryId: categoriesMap['Lights'],
      subcategory: 'Continuous Lights',
      totalStock: 2,
    },
    // Strobe Lights
    {
      name: 'Godox AD200 Pro',
      slug: 'godox-ad200-pro',
      description: 'Pocket-sized outdoor flash strobe with 200Ws power, TTL capability, and built-in 2.4G wireless system.',
      specs: JSON.stringify({ power: '200Ws', sync: 'HSS up to 1/8000s', weight: '590g' }),
      dailyRate: 800.0,
      weeklyRate: 4800.0,
      depositAmount: 4000.0,
      images: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=600&q=80',
      vendorId: vendor1.id,
      categoryId: categoriesMap['Lights'],
      subcategory: 'Strobe Lights',
      totalStock: 8,
    },
    {
      name: 'Godox AD300 Pro',
      slug: 'godox-ad300-pro',
      description: 'A powerful 300Ws outdoor strobe featuring compact design, high speed sync, and stable color temperature.',
      specs: JSON.stringify({ power: '300Ws', recycleTime: '0.01-1.5s', weight: '1.25kg' }),
      dailyRate: 1000.0,
      weeklyRate: 6000.0,
      depositAmount: 5000.0,
      images: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=600&q=80',
      vendorId: vendor1.id,
      categoryId: categoriesMap['Lights'],
      subcategory: 'Strobe Lights',
      totalStock: 5,
    },
    {
      name: 'Godox AD600 Pro',
      slug: 'godox-ad600-pro',
      description: 'An all-in-one outdoor flash featuring 600Ws power, 0.01-0.9s recycle time, and 38W LED modeling lamp.',
      specs: JSON.stringify({ power: '600Ws', modelingLamp: '38W LED', sync: '1/8000s HSS' }),
      dailyRate: 1200.0,
      weeklyRate: 7200.0,
      depositAmount: 8000.0,
      images: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=600&q=80',
      vendorId: vendor2.id,
      categoryId: categoriesMap['Lights'],
      subcategory: 'Strobe Lights',
      totalStock: 4,
    },
    {
      name: 'Godox QT 600',
      slug: 'godox-qt-600',
      description: 'High-speed studio flash designed for action and creative photography, offering fast recycle times.',
      specs: JSON.stringify({ power: '600Ws', colorTemp: '5600K', duration: '1/28984s' }),
      dailyRate: 2000.0,
      weeklyRate: 12000.0,
      depositAmount: 10000.0,
      images: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=600&q=80',
      vendorId: vendor1.id,
      categoryId: categoriesMap['Lights'],
      subcategory: 'Strobe Lights',
      totalStock: 3,
    },
    {
      name: 'Godox SK 400 II',
      slug: 'godox-sk-400-ii',
      description: 'Compact studio flash with built-in Godox 2.4G wireless X system, suitable for portrait and product photography.',
      specs: JSON.stringify({ power: '400Ws', guideNum: '65', mount: 'Bowens' }),
      dailyRate: 1000.0,
      weeklyRate: 6000.0,
      depositAmount: 5000.0,
      images: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=600&q=80',
      vendorId: vendor1.id,
      categoryId: categoriesMap['Lights'],
      subcategory: 'Strobe Lights',
      totalStock: 4,
    },
    {
      name: 'Godox V1',
      slug: 'godox-v1',
      description: 'Round head camera flash speedlight offering soft, smooth light effects for on-camera and off-camera use.',
      specs: JSON.stringify({ power: '76Ws', headType: 'Round', battery: 'Li-ion battery pack' }),
      dailyRate: 500.0,
      weeklyRate: 3000.0,
      depositAmount: 2000.0,
      images: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=600&q=80',
      vendorId: vendor2.id,
      categoryId: categoriesMap['Lights'],
      subcategory: 'Strobe Lights',
      totalStock: 7,
    },
    // Accessories
    {
      name: '10x10 Skimmer',
      slug: '10x10-skimmer',
      description: 'A 10x10 overhead skimmer frame and silk diffusion screen for outdoor overhead light control.',
      specs: JSON.stringify({ size: '10ft x 10ft', diffusion: '1.5-stops silk', frame: 'Aluminum' }),
      dailyRate: 1200.0,
      weeklyRate: 7200.0,
      depositAmount: 5000.0,
      images: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=600&q=80',
      vendorId: vendor1.id,
      categoryId: categoriesMap['Lights'],
      subcategory: 'Accessories',
      totalStock: 4,
    },
    {
      name: '15x15 Chroma Green Screen',
      slug: '15x15-chroma-green',
      description: 'Large chroma key green screen backdrop, seamless cotton material with sturdy support stand system.',
      specs: JSON.stringify({ size: '15ft x 15ft', material: 'Cotton', stands: '2 heavy duty' }),
      dailyRate: 1500.0,
      weeklyRate: 9000.0,
      depositAmount: 5000.0,
      images: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=600&q=80',
      vendorId: vendor1.id,
      categoryId: categoriesMap['Lights'],
      subcategory: 'Accessories',
      totalStock: 3,
    },
    {
      name: '3x3 Cutter Frame with Black Cloth',
      slug: '3x3-cutter-frame',
      description: 'Solid flag cutter frame with black solid flag fabric for light block and negative fill control.',
      specs: JSON.stringify({ size: '3ft x 3ft', material: 'Black solid cotton' }),
      dailyRate: 250.0,
      weeklyRate: 1500.0,
      depositAmount: 1000.0,
      images: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=600&q=80',
      vendorId: vendor2.id,
      categoryId: categoriesMap['Lights'],
      subcategory: 'Accessories',
      totalStock: 8,
    },
    {
      name: '4x4 Cutter Frame with Black Cloth',
      slug: '4x4-cutter-frame',
      description: 'Solid flag cutter frame with black solid flag fabric for large light block and negative fill.',
      specs: JSON.stringify({ size: '4ft x 4ft', material: 'Black solid cotton' }),
      dailyRate: 350.0,
      weeklyRate: 2100.0,
      depositAmount: 1500.0,
      images: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=600&q=80',
      vendorId: vendor2.id,
      categoryId: categoriesMap['Lights'],
      subcategory: 'Accessories',
      totalStock: 6,
    },
    {
      name: '6x6 Grid Cloth',
      slug: '6x6-grid-cloth',
      description: 'A 6x6 light diffusion grid cloth for soft and even light scattering on set.',
      specs: JSON.stringify({ size: '6ft x 6ft', type: 'Grid cloth diffusion' }),
      dailyRate: 800.0,
      weeklyRate: 4800.0,
      depositAmount: 3000.0,
      images: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=600&q=80',
      vendorId: vendor1.id,
      categoryId: categoriesMap['Lights'],
      subcategory: 'Accessories',
      totalStock: 5,
    },
    {
      name: '6x6 Silver Cloth',
      slug: '6x6-silver-cloth',
      description: 'Silver reflector fabric for bouncing bright, specular light highlights.',
      specs: JSON.stringify({ size: '6ft x 6ft', surface: 'Silver reflective' }),
      dailyRate: 500.0,
      weeklyRate: 3000.0,
      depositAmount: 2000.0,
      images: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=600&q=80',
      vendorId: vendor2.id,
      categoryId: categoriesMap['Lights'],
      subcategory: 'Accessories',
      totalStock: 5,
    },

    // === OTHER GENERAL ITEMS ===
    {
      name: 'Sony FE 24-70mm f/2.8 GM II',
      slug: 'sony-fe-24-70mm-f2-8-gm-ii',
      description: 'The Sony FE 24-70mm f/2.8 GM II is a standard zoom lens with optical G Master quality.',
      specs: JSON.stringify({ focalLength: '24-70mm', aperture: 'f/2.8', mount: 'Sony E-mount' }),
      dailyRate: 45.0,
      weeklyRate: 220.0,
      depositAmount: 300.0,
      images: 'https://images.unsplash.com/photo-1617005082133-548c4dd27f35?auto=format&fit=crop&w=600&q=80',
      vendorId: vendor1.id,
      categoryId: categoriesMap['Lenses'],
      subcategory: null,
      totalStock: 4,
    },
    {
      name: 'Canon RF 50mm f/1.2L USM',
      slug: 'canon-rf-50mm-f1-2l',
      description: 'Ultra-fast Canon prime lens with extreme low-light performance and shallow depth of field.',
      specs: JSON.stringify({ focalLength: '50mm', aperture: 'f/1.2', mount: 'Canon RF' }),
      dailyRate: 50.0,
      weeklyRate: 250.0,
      depositAmount: 400.0,
      images: 'https://images.unsplash.com/photo-1616423643764-7e57ba7950c2?auto=format&fit=crop&w=600&q=80',
      vendorId: vendor2.id,
      categoryId: categoriesMap['Lenses'],
      subcategory: null,
      totalStock: 3,
    },
    {
      name: 'Sennheiser MKH416 Shotgun Microphone',
      slug: 'sennheiser-mkh416',
      description: 'Professional shotgun microphone ideal for films, broadcast, and voiceovers.',
      specs: JSON.stringify({ polarPattern: 'Supercardioid', connection: 'XLR' }),
      dailyRate: 30.0,
      weeklyRate: 150.0,
      depositAmount: 200.0,
      images: 'https://images.unsplash.com/photo-1590602847861-f357a9332bbc?auto=format&fit=crop&w=600&q=80',
      vendorId: vendor1.id,
      categoryId: categoriesMap['Audio'],
      subcategory: null,
      totalStock: 6,
    },
    {
      name: 'Sachtler Flowtech 75 Tripod System',
      slug: 'sachtler-flowtech-75',
      description: 'Premium carbon-fiber tripod legs with fluid head FSB-4.',
      specs: JSON.stringify({ material: 'Carbon Fiber', head: 'FSB-4 Fluid Head' }),
      dailyRate: 40.0,
      weeklyRate: 200.0,
      depositAmount: 300.0,
      images: 'https://images.unsplash.com/photo-1495707902641-75cac588d2e9?auto=format&fit=crop&w=600&q=80',
      vendorId: vendor1.id,
      categoryId: categoriesMap['Support'],
      subcategory: null,
      totalStock: 4,
    }
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
