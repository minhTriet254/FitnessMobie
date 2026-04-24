namespace Api.Services;

public interface IGeminiService
{
    Task<string> GetBmiAnalysis(double height, double weight, string gender);
}