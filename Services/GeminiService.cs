using System;
using System.Net.Http;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;
using Microsoft.Extensions.Configuration;

namespace Api.Services
{
    public class GeminiService : IGeminiService
    {
        private readonly string _apiKey;

        public GeminiService(IConfiguration configuration)
        {
            _apiKey = configuration["Gemini:ApiKey"];
        }

        public async Task<string> GetBmiAnalysis(double height, double weight, string gender)
        {
            using var httpClient = new HttpClient();
            
            double heightInMeters = height > 10 ? height / 100.0 : height;
            
            var bmi = weight / (heightInMeters * heightInMeters);
            
            var genderText = (gender ?? "").ToLower() switch
            {
                "male" or "nam" => "nam",
                "female" or "nữ" or "nu" => "nữ",
                _ => "nam" 
            };
            
            var prompt = $@"
Bạn là chuyên gia fitness. Phân tích ngắn gọn cho người {genderText}, cao {heightInMeters:F2}m, nặng {weight}kg, BMI = {bmi:F1}.
Trả về CHÍNH XÁC JSON, không thêm markdown hay text:
{{
    ""bmi"": {bmi:F1},
    ""category"": ""Gầy/Bình thường/Thừa cân/Béo phì"",
    ""analysis"": ""phân tích ngắn gọn 2-3 câu bằng tiếng Việt có đề cập giới tính {genderText}"",
    ""recommendations"": [""đề xuất 1 cụ thể"", ""đề xuất 2 cụ thể"", ""đề xuất 3 cụ thể""]
}}
";

            try
            {
                var requestBody = new
                {
                    contents = new[]
                    {
                        new
                        {
                            parts = new[]
                            {
                                new { text = prompt }
                            }
                        }
                    }
                };

                var json = JsonSerializer.Serialize(requestBody);
                var content = new StringContent(json, Encoding.UTF8, "application/json");

                var response = await httpClient.PostAsync(
                    $"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key={_apiKey}",
                    content
                );

                if (!response.IsSuccessStatusCode)
                {
                    return GetFallbackAnalysis(bmi, genderText);
                }

                var responseContent = await response.Content.ReadAsStringAsync();
                var jsonDoc = JsonDocument.Parse(responseContent);
                var text = jsonDoc.RootElement
                    .GetProperty("candidates")[0]
                    .GetProperty("content")
                    .GetProperty("parts")[0]
                    .GetProperty("text")
                    .GetString();

                text = text.Replace("```json", "").Replace("```", "").Trim();
                
                // Validate JSON hợp lệ
                try
                {
                    JsonDocument.Parse(text);
                    return text;
                }
                catch
                {
                    return GetFallbackAnalysis(bmi, genderText);
                }
            }
            catch
            {
                return GetFallbackAnalysis(bmi, genderText);
            }
        }

        private string GetFallbackAnalysis(double bmi, string genderText)
        {
            string category = bmi switch
            {
                < 18.5 => "Thiếu cân",
                < 25 => "Bình thường",
                < 30 => "Thừa cân",
                _ => "Béo phì"
            };

            string analysis = (bmi, genderText) switch
            {
                (< 18.5, "nam") => "Bạn đang thiếu cân. Cần tăng cường dinh dưỡng và tập luyện sức mạnh để đạt cân nặng lý tưởng cho nam giới.",
                (< 18.5, "nữ") => "Bạn đang thiếu cân. Nên bổ sung dinh dưỡng và tập luyện nhẹ nhàng để cải thiện vóc dáng.",
                (< 25, "nam") => "Bạn đang ở mức cân nặng lý tưởng cho nam giới. Tiếp tục duy trì chế độ tập luyện hiện tại.",
                (< 25, "nữ") => "Bạn đang ở mức cân nặng lý tưởng cho nữ giới. Tiếp tục duy trì chế độ hiện tại.",
                (< 30, "nam") => "Bạn đang thừa cân. Nên kết hợp cardio và tập tạ để giảm mỡ, tăng cơ.",
                (< 30, "nữ") => "Bạn đang thừa cân. Nên tập yoga, cardio và điều chỉnh chế độ ăn.",
                _ => "Bạn cần giảm cân để cải thiện sức khỏe. Hãy tham khảo ý kiến chuyên gia."
            };

            string[] recommendations = (bmi, genderText) switch
            {
                (< 18.5, "nam") => new[]
                {
                    "Tăng 500 calo/ngày với thực phẩm giàu protein",
                    "Tập compound 3 lần/tuần (squat, deadlift, bench press)",
                    "Bổ sung whey protein và creatine"
                },
                (< 18.5, "nữ") => new[]
                {
                    "Tăng 300 calo/ngày từ thực phẩm lành mạnh",
                    "Tập yoga và pilates 3 lần/tuần",
                    "Bổ sung sắt và canxi"
                },
                (< 25, "nam") => new[]
                {
                    "Duy trì tập gym 4-5 lần/tuần",
                    "Ăn đủ 1.6-2g protein/kg cân nặng",
                    "Ngủ đủ 7-8 tiếng mỗi đêm"
                },
                (< 25, "nữ") => new[]
                {
                    "Duy trì cardio 150 phút/tuần",
                    "Ăn đa dạng rau xanh và trái cây",
                    "Uống đủ 2 lít nước mỗi ngày"
                },
                (< 30, "nam") => new[]
                {
                    "Giảm 300 calo/ngày, tăng protein",
                    "Tập HIIT 3 lần/tuần đốt mỡ",
                    "Hạn chế bia rượu và đồ ngọt"
                },
                (< 30, "nữ") => new[]
                {
                    "Giảm 200 calo/ngày, chia nhỏ bữa ăn",
                    "Tập zumba hoặc aerobic 4 lần/tuần",
                    "Hạn chế đồ chiên rán và tinh bột"
                },
                _ => new[]
                {
                    "Tham khảo ý kiến bác sĩ dinh dưỡng",
                    "Bắt đầu với đi bộ 30 phút/ngày",
                    "Cắt giảm đường và tinh bột xấu"
                }
            };

            var result = new
            {
                bmi = Math.Round(bmi, 1),
                category,
                analysis,
                recommendations
            };

            return JsonSerializer.Serialize(result);
        }
    }
}