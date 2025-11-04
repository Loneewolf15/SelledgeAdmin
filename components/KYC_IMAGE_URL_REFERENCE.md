# KYC Image URL Reference

## Updated Component
**File:** `admin/components/kyc-review-detail.tsx`

## Image URL Structure

### Backend Upload Directory
```
/opt/lampp/htdocs/selledgez/backend/public/uploads/kyc/{kycId}/
```

### Public URL Format
```
http://localhost/selledgez/backend/public/uploads/kyc/{kycId}/{filename}
```

## Example

For a KYC request with:
- **KYC ID:** `d5329e2c-bdf9-fbba-48b1-c5b65901ef01`
- **Files:** `front.jpg`, `back.jpg`, `selfie.jpg`

### Full URLs:
```
http://localhost/selledgez/backend/public/uploads/kyc/d5329e2c-bdf9-fbba-48b1-c5b65901ef01/front.jpg
http://localhost/selledgez/backend/public/uploads/kyc/d5329e2c-bdf9-fbba-48b1-c5b65901ef01/back.jpg
http://localhost/selledgez/backend/public/uploads/kyc/d5329e2c-bdf9-fbba-48b1-c5b65901ef01/selfie.jpg
```

## Implementation

### Helper Function
```typescript
const getImageUrl = (imagePath: string | undefined) => {
  if (!imagePath) return "/placeholder.svg"
  
  // If already a full URL, return as is
  if (imagePath.startsWith("http")) return imagePath
  
  // If it's a relative path starting with /, construct full URL
  if (imagePath.startsWith("/")) {
    return `${BASE_URL}${imagePath}`
  }
  
  // Otherwise, assume it's from uploads/kyc/{kycId}/
  return `${BASE_URL}/uploads/kyc/${request.id}/${imagePath}`
}
```

### Usage in Component
```tsx
<img
  src={getImageUrl(request.documents.frontImage)}
  alt="Document front"
  className="w-full rounded-lg border"
  onError={(e) => {
    e.currentTarget.src = "/placeholder.svg"
  }}
/>
```

## Data Format from Backend

The backend returns KYC document URLs in the following format:

### Database Storage
```sql
doc_front_url: /uploads/kyc/{kycId}/front.jpg
doc_back_url:  /uploads/kyc/{kycId}/back.jpg
selfie_url:    /uploads/kyc/{kycId}/selfie.jpg
```

### API Response
```json
{
  "id": "d5329e2c-bdf9-fbba-48b1-c5b65901ef01",
  "documents": {
    "frontImage": "/uploads/kyc/d5329e2c-bdf9-fbba-48b1-c5b65901ef01/front.jpg",
    "backImage": "/uploads/kyc/d5329e2c-bdf9-fbba-48b1-c5b65901ef01/back.jpg",
    "selfieImage": "/uploads/kyc/d5329e2c-bdf9-fbba-48b1-c5b65901ef01/selfie.jpg"
  }
}
```

## Environment Variables

Set the base URL in your `.env.local`:

```bash
NEXT_PUBLIC_API_URL=http://localhost/selledgez/backend/public
```

For production:
```bash
NEXT_PUBLIC_API_URL=https://api.selledgez.com
```

## Error Handling

Each image has an `onError` handler that falls back to a placeholder:

```tsx
onError={(e) => {
  e.currentTarget.src = "/placeholder.svg"
}
```

This ensures the UI doesn't break if:
- Image file is missing
- URL is incorrect
- Network error occurs
- CORS issues

## Features

✅ Automatic URL construction  
✅ Supports relative paths from backend  
✅ Supports full URLs  
✅ Fallback to placeholder on error  
✅ Configurable via environment variables  
✅ Works for all three document types (front, back, selfie)

## Testing

To test the image URLs:

1. Submit a KYC request via the user frontend
2. Check the uploaded files in the backend:
   ```bash
   ls -la /opt/lampp/htdocs/selledgez/backend/public/uploads/kyc/{kycId}/
   ```
3. Access the image directly in browser:
   ```
   http://localhost/selledgez/backend/public/uploads/kyc/{kycId}/front.jpg
   ```
4. View in admin panel KYC review detail page

## File Structure

```
backend/public/uploads/kyc/
├── d5329e2c-bdf9-fbba-48b1-c5b65901ef01/
│   ├── front.jpg
│   ├── back.jpg
│   └── selfie.jpg
└── {another-kyc-id}/
    ├── front.png
    └── selfie.png
```

Each KYC submission gets its own directory named after the KYC UUID.

