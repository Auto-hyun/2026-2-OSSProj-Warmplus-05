/**
 * Suno가 작곡이 끝났다고 알려 오는 주소. sunoapi.org가 꼭 받으라고 해서 두지만,
 * 앱은 /api/songs/[taskId]로 직접 확인하므로 받았다고만 답한다.
 */
export async function POST() {
  return Response.json({ ok: true });
}
