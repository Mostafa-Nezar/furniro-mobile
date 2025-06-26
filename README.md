# Furniro Mobile App - Updated Version

## التحديثات المطبقة

### 1. الأيقونات الحديثة
- تم تثبيت مكتبة `react-native-vector-icons` للحصول على أيقونات حديثة
- تم استخدام أيقونات Material Icons في جميع أنحاء التطبيق
- تم تحديث الأيقونات في Header، Navigation، وجميع المكونات

### 2. تحويل إلى Functional Components
- جميع المكونات الآن تستخدم Functional Components بدلاً من Class Components
- تم استخدام React Hooks (useState, useEffect, useContext)
- تحسين الأداء والقابلية للقراءة

### 3. تغيير امتداد الملفات
- تم تغيير جميع ملفات `.js` إلى `.jsx`
- تحديث جميع مسارات الاستيراد لتتوافق مع الامتدادات الجديدة

### 4. ربط بـ API الخلفي
- إنشاء `ApiService.jsx` للتعامل مع API الخلفي
- تحديث `DataService.jsx` لاستخدام API مع fallback للبيانات المحلية
- تحديث `AuthService.jsx` لدعم API المصادقة
- دعم الصور من الخادم مع fallback للصور المحلية

## البنية الجديدة

```
src/
├── components/
│   ├── Header.jsx
│   └── ProductCard.jsx
├── constants/
│   └── theme.jsx
├── context/
│   └── AppContext.jsx
├── navigation/
│   └── AppNavigator.jsx
├── screens/
│   ├── CartScreen.jsx
│   ├── HomeScreen.jsx
│   ├── LoginScreen.jsx
│   ├── ProductDetailScreen.jsx
│   ├── ProfileScreen.jsx
│   ├── RegisterScreen.jsx
│   ├── SearchScreen.jsx
│   ├── ShopScreen.jsx
│   └── SplashScreen.jsx
└── services/
    ├── ApiService.jsx
    ├── AuthService.jsx
    └── DataService.jsx
```

## API Endpoints المدعومة

### Products
- `GET /api/products/db` - جلب جميع المنتجات
- `GET /api/products/db/:id` - جلب منتج محدد
- `GET /api/products/db/search?q=query` - البحث في المنتجات
- `GET /api/products/db/category/:category` - جلب منتجات حسب الفئة

### Authentication
- `POST /api/auth/login` - تسجيل الدخول
- `POST /api/auth/register` - إنشاء حساب جديد

### Ratings
- `GET /api/ratings/:productId` - جلب تقييمات المنتج
- `POST /api/ratings` - إضافة تقييم جديد

## الميزات الجديدة

1. **دعم الصور من الخادم**: الصور تُحمل من `http://localhost:3001/uploads/`
2. **Fallback للبيانات**: في حالة عدم توفر API، يتم استخدام البيانات المحلية
3. **أيقونات حديثة**: استخدام Material Icons للحصول على مظهر عصري
4. **أداء محسن**: استخدام Functional Components و Hooks

## التشغيل

```bash
# تثبيت التبعيات
npm install

# تشغيل التطبيق
npm start
```

## ملاحظات مهمة

- تأكد من تشغيل الخادم الخلفي على `http://localhost:3001`
- في حالة عدم توفر الخادم، سيعمل التطبيق بالبيانات المحلية
- جميع الأيقونات الآن تستخدم `react-native-vector-icons`
- تم الحفاظ على التوافق مع الإصدار السابق

