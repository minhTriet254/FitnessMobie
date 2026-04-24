using Api.Data;
using Api.Models;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace Api.Seed
{
    public static class SeedData
    {
        public static async Task SeedAdminAsync(
            UserManager<User> userManager,
            RoleManager<IdentityRole> roleManager)
        {
            // Create roles
            if (!await roleManager.RoleExistsAsync("Admin"))
                await roleManager.CreateAsync(new IdentityRole("Admin"));

            if (!await roleManager.RoleExistsAsync("User"))
                await roleManager.CreateAsync(new IdentityRole("User"));

            // Create Admin
            var admin = await userManager.FindByNameAsync("admin11");

            if (admin == null)
            {
                var newAdmin = new User
                {
                    UserName = "admin11",
                    Email = "admin@gmail.com"
                };

                await userManager.CreateAsync(newAdmin, "minhTriet2504");
                await userManager.AddToRoleAsync(newAdmin, "Admin");
            }
        }

        public static async Task SeedPremiumPackagesAsync(ApplicationDbContext context)
        {
            if (!await context.PremiumConfigs.AnyAsync())
            {
                var packages = new List<PremiumConfig>
                {
                    new PremiumConfig 
                    { 
                        Name = "Premium 1 tháng", 
                        Months = 1, 
                        Price = 200000,
                        DiscountPrice = 200000,
                        Description = "Sử dụng Premium trong 1 tháng",
                        IsActive = true 
                    },
                    new PremiumConfig 
                    { 
                        Name = "Premium 3 tháng", 
                        Months = 3, 
                        Price = 500000,
                        DiscountPrice = 450000,
                        Description = "Tiết kiệm 10% khi mua 3 tháng",
                        IsActive = true 
                    },
                    new PremiumConfig 
                    { 
                        Name = "Premium 6 tháng", 
                        Months = 6, 
                        Price = 900000,
                        DiscountPrice = 800000,
                        Description = "Tiết kiệm 11% khi mua 6 tháng",
                        IsActive = true 
                    },
                };
                
                await context.PremiumConfigs.AddRangeAsync(packages);
                await context.SaveChangesAsync();
            }
        }

        public static async Task SeedCoursesAndLessonsAsync(ApplicationDbContext context)
        {
            // 1. Seed courses nếu chưa có
            if (!await context.Courses.AnyAsync())
            {
                var courses = new List<Course>
                {
                    new Course
                    {
                        Name = "Các bài tập",
                        Description = "CourseGym giúp bạn xây dựng thể hình toàn diện với lộ trình rõ ràng, từ cơ bản đến nâng cao. Hướng dẫn chi tiết từng bài tập, kỹ thuật đúng chuẩn, kết hợp chế độ dinh dưỡng và nghỉ ngơi hợp lý để đạt hiệu quả tối đa. Phù hợp cho cả người mới bắt đầu và người muốn cải thiện vóc dáng nhanh chóng",
                        Price = 0,
                        StartDate = DateTime.UtcNow,
                        EndDate = DateTime.UtcNow.AddMonths(1)
                    },
                    new Course
                    {
                        Name = "Dinh dưỡng",
                        Description = "Hướng dẫn dinh dưỡng cho người tập gym",
                        Price = 1,
                        StartDate = DateTime.UtcNow,
                        EndDate = DateTime.UtcNow.AddMonths(1)
                    },
                    new Course
                    {
                        Name = "Nguyên liệu & Calories",
                        Description = "Tìm hiểu về calo và nguyên liệu thực phẩm",
                        Price = 0,
                        StartDate = DateTime.UtcNow,
                        EndDate = DateTime.UtcNow.AddMonths(1)
                    },
                    new Course
                    {
                        Name = "Thực Phẩm bổ sung",
                        Description = "Các loại thực phẩm bổ sung cho gymer",
                        Price = 0,
                        StartDate = DateTime.UtcNow,
                        EndDate = DateTime.UtcNow.AddMonths(1)
                    }
                };

                await context.Courses.AddRangeAsync(courses);
                await context.SaveChangesAsync();
            }

            // 2. Lấy course "Các bài tập"
            var exerciseCourse = await context.Courses.FirstOrDefaultAsync(c => c.Name == "Các bài tập");
            if (exerciseCourse == null)
            {
                exerciseCourse = new Course
                {
                    Name = "Các bài tập",
                    Description = "CourseGym giúp bạn xây dựng thể hình toàn diện...",
                    Price = 0,
                    StartDate = DateTime.UtcNow,
                    EndDate = DateTime.UtcNow.AddMonths(1)
                };
                await context.Courses.AddAsync(exerciseCourse);
                await context.SaveChangesAsync();
            }

            // 3. Seed lessons cho course "Các bài tập" nếu chưa có
            var existingLessons = await context.Lessons
                .Where(l => l.CourseId == exerciseCourse.Id)
                .AnyAsync();

            if (!existingLessons)
            {
                var lessons = new List<Lesson>
                {
                    new Lesson
                    {
                        Title = "Ngực",
                        Content = @"Bài tập ngực giúp phát triển cơ ngực to và săn chắc.
        Các bài tập chính:
        - Bench Press (Đẩy ngực nằm)
        - Incline Press (Đẩy ngực dốc lên)
        - Decline Press (Đẩy ngực dốc xuống)
        - Dumbbell Fly (Bay ngực với tạ đơn)
        - Cable Crossover (Kéo cáp ngực)

        Số hiệp: 4-5 hiệp
        Số lần: 8-12 lần/hiệp
        Nghỉ giữa hiệp: 60-90 giây",
                        CourseId = exerciseCourse.Id
                    },
                    new Lesson
                    {
                        Title = "Lưng",
                        Content = @"Bài tập lưng giúp tạo hình chữ V đẹp.
        Các bài tập chính:
        - Pull Up (Xà đơn)
        - Lat Pulldown (Kéo xô)
        - Seated Cable Row (Kéo cáp ngồi)
        - Bent Over Row (Hàng tạ cúi người)
        - Deadlift (Kéo tạ chết)

        Số hiệp: 4-5 hiệp
        Số lần: 8-12 lần/hiệp
        Nghỉ giữa hiệp: 60-90 giây",
                        CourseId = exerciseCourse.Id
                    },
                    new Lesson
                    {
                        Title = "Vai",
                        Content = @"Bài tập vai giúp phát triển cơ vai tròn trịa.
        Các bài tập chính:
        - Shoulder Press (Đẩy vai)
        - Lateral Raise (Bay vai ngang)
        - Front Raise (Bay vai trước)
        - Rear Delt Fly (Bay vai sau)
        - Upright Row (Hàng tạ đứng)

        Số hiệp: 3-4 hiệp
        Số lần: 10-15 lần/hiệp
        Nghỉ giữa hiệp: 45-60 giây",
                        CourseId = exerciseCourse.Id
                    },
                    new Lesson
                    {
                        Title = "Cơ tay trước (Biceps)",
                        Content = @"Bài tập tay trước giúp bắp tay to và săn chắc.
        Các bài tập chính:
        - Barbell Curl (Cuốn tạ đòn)
        - Dumbbell Curl (Cuốn tạ đơn)
        - Hammer Curl (Cuốn búa)
        - Preacher Curl (Cuốn ghế Preacher)
        - Concentration Curl (Cuốn tập trung)

        Số hiệp: 3-4 hiệp
        Số lần: 10-12 lần/hiệp
        Nghỉ giữa hiệp: 45-60 giây",
                        CourseId = exerciseCourse.Id
                    },
                    new Lesson
                    {
                        Title = "Cơ tay sau (Triceps)",
                        Content = @"Bài tập tay sau chiếm 2/3 kích thước cánh tay.
        Các bài tập chính:
        - Triceps Pushdown (Kéo cáp tay sau)
        - Skull Crusher (Đập hộp sọ)
        - Close Grip Bench Press (Đẩy ngực tay hẹp)
        - Overhead Extension (Duỗi tay qua đầu)
        - Triceps Dip (Chống đẩy xà kép)

        Số hiệp: 3-4 hiệp
        Số lần: 10-12 lần/hiệp
        Nghỉ giữa hiệp: 45-60 giây",
                        CourseId = exerciseCourse.Id
                    },
                    new Lesson
                    {
                        Title = "Cơ bụng (Abs)",
                        Content = @"Bài tập bụng giúp tạo cơ bụng 6 múi.
        Các bài tập chính:
        - Crunch (Gập bụng)
        - Leg Raise (Nâng chân)
        - Plank (Tấm ván)
        - Russian Twist (Xoay Nga)
        - Bicycle Crunch (Gập bụng đạp xe)

        Số hiệp: 3-4 hiệp
        Số lần: 15-20 lần/hiệp
        Nghỉ giữa hiệp: 30-45 giây",
                        CourseId = exerciseCourse.Id
                    },
                    new Lesson
                    {
                        Title = "Tập Cardio",
                        Content = @"Cardio giúp đốt mỡ và tăng sức bền.
        Các bài tập cardio hiệu quả:
        - Chạy bộ (30-45 phút)
        - Đạp xe (30-45 phút)
        - Nhảy dây (15-20 phút)
        - HIIT (20-25 phút)
        - Bơi lội (30-40 phút)

        Thời gian khuyến nghị: 3-4 buổi/tuần, 30-45 phút/buổi
        Kết hợp cardio sau tập tạ để đốt mỡ tối ưu",
                        CourseId = exerciseCourse.Id
                    }
                };

                await context.Lessons.AddRangeAsync(lessons);
                await context.SaveChangesAsync();

                // 4. Seed videos cho mỗi lesson (nếu chưa có video nào trong db)
                if (!await context.Videos.AnyAsync())
                {
                    var videos = new List<Video>();
                    foreach (var lesson in lessons)
                    {
                        videos.Add(new Video
                        {
                            Url = $"https://youtube.com/watch?v=example-{lesson.Title.ToLower()}",
                            Description = $"Video hướng dẫn chi tiết bài tập {lesson.Title} - Kỹ thuật, lưu ý và các biến thể",
                            Feedback = "Video được hướng dẫn bởi HLV có chứng chỉ quốc tế",
                            Rating = 5,
                            LessonId = lesson.Id
                        });
                    }
                    await context.Videos.AddRangeAsync(videos);
                    await context.SaveChangesAsync();
                }
            }
        }


    }
}