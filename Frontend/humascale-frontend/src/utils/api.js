/**
 * Normalize Laravel ApiResponse envelopes so pages can read business fields
 * (`has_assessment`, `pillars`, `assessment`) while paginated lists keep
 * `{ data, meta, unread_count }`.
 *
 * @param {unknown} result
 */
export function unwrapEnvelope(result) {
  if (!result || typeof result !== 'object') return result;
  if (result.success !== true) return result;

  const payload = result.data;
  if (Array.isArray(payload) || payload == null) {
    return {
      data: payload ?? [],
      meta: result.meta,
      unread_count: result.unread_count,
      message: result.message,
      success: true,
    };
  }

  return {
    ...payload,
    ...(result.meta ? { meta: result.meta } : {}),
    ...(result.unread_count !== undefined ? { unread_count: result.unread_count } : {}),
  };
}

/**
 * User /me is a flat object. Login/register wrap the user inside `data`.
 *
 * @param {unknown} res
 */
export function extractUser(res) {
  if (!res || typeof res !== 'object') return null;
  if (res.id && res.email) return res;
  if (res.data?.id) return res.data;
  if (res.user?.id) return res.user;
  return null;
}

export function extractToken(res) {
  if (!res || typeof res !== 'object') return null;
  return (
    res.data?.access_token ||
    res.data?.token ||
    res.access_token ||
    res.token ||
    null
  );
}
