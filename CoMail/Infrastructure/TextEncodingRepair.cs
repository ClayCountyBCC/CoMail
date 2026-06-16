using System.Text;

namespace CoMail.Infrastructure
{
  public static class TextEncodingRepair
  {
    private static readonly Encoding Windows1252 = Encoding.GetEncoding(1252);

    public static string Normalize(string value)
    {
      if (string.IsNullOrEmpty(value) || !LooksCorrupted(value))
      {
        return value;
      }

      try
      {
        // Repair the common case where UTF-8 text was decoded as Windows-1252.
        return Encoding.UTF8.GetString(Windows1252.GetBytes(value));
      }
      catch
      {
        return value;
      }
    }

    private static bool LooksCorrupted(string value)
    {
      return
        value.Contains("\u00E2\u20AC") ||
        value.IndexOf('\u00C3') >= 0 ||
        value.IndexOf('\u00C2') >= 0 ||
        value.IndexOf('\uFFFD') >= 0;
    }
  }
}
