# Video Reviews — সেটআপ গাইড

এই আপডেটে Video Reviews admin panel থেকে MP4/WebM ভিডিও সরাসরি Supabase Storage-এ আপলোড করা যায়। পাবলিক পেজে ভিডিওর থাম্বনেইল আগে দেখা যায়; ভিজিটর ক্লিক করলে তবেই ভিডিও প্লেয়ার খোলে। প্লেয়ারে loading spinner, close button, Escape key, বাইরে ক্লিক করে বন্ধ করা, mobile responsive sizing এবং playback বন্ধ করার ব্যবস্থা আছে।

## Supabase সেটিংস

এই প্রজেক্টের `supabase-schema.sql`-এ আগে থেকেই `portfolio-media` নামে public Storage bucket এবং admin-only upload/update/delete policies আছে। ওই schema আগে চালানো থাকলে নতুন table বা SQL migration দরকার নেই।

Supabase Dashboard → Storage → `portfolio-media` bucket-এ নিশ্চিত করুন:

- Bucket public আছে, যাতে visitor ভিডিও দেখতে পারে।
- File size limit অন্তত 50 MB সেট করা আছে (যদি project/bucket limit আলাদা করে কমানো হয়ে থাকে)।
- `storage.objects`-এর admin insert/update/delete policies এবং `public.is_admin()` function schema থেকে তৈরি আছে।

## Admin panel থেকে ভিডিও যোগ করা

1. `/admin/video-reviews` খুলুন এবং admin হিসেবে sign in করুন।
2. Client name দিন; Role, Company, Thumbnail ও Quote ঐচ্ছিক।
3. **Upload video file** ক্লিক করে MP4 বা WebM নির্বাচন করুন। সর্বোচ্চ 50 MB; 30–60 সেকেন্ডের ভিডিওর জন্য MP4/H.264 এবং 720p ভালো পছন্দ।
4. Upload সম্পূর্ণ হলে **Save Changes** চাপুন। তারপর public `/reviews/videos` পেজে ভিডিওটি দেখাবে।
5. ভিডিও বদলাতে Edit → Replace video file → নতুন ফাইল upload → Save Changes করুন। পুরনো Supabase ভিডিও/thumbnail ফাইল পরিবর্তন সফল হলে পরিষ্কার করা হয়।
6. শুধু ভিডিও সরাতে Edit → Remove → Save Changes করুন। পুরো review মুছতে item-এর **Delete** ব্যবহার করুন; review মুছলে তার Supabase video ও thumbnail ফাইলও মুছে ফেলার চেষ্টা করা হয়।

## গুরুত্বপূর্ণ

- পুরনো YouTube review রেকর্ডগুলো স্বয়ংক্রিয়ভাবে YouTube থেকে Supabase-এ কপি হয় না। Admin panel-এ প্রতিটি পুরনো review Edit করে নিজের MP4/WebM ফাইল upload করলে সেটি Supabase video হিসেবে ব্যবহৃত হবে। পরিবর্তন না করা পুরনো YouTube review আপাতত কাজ করতে থাকবে।
- Upload UI 50 MB-এর বেশি ফাইল প্রত্যাখ্যান করে। Supabase-এর dashboard limit এর চেয়ে কম হলে সেটিও বাড়াতে হবে।
- ভিডিওগুলো Next.js `public` folder-এ রাখা হয় না; Supabase Storage থেকে stream/download হয়। পেজ লোডের সময় ভিডিও ফাইল ডাউনলোড হয় না—শুধু ক্লিক করার পর player তৈরি হয়।
