import { inject, Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

/**
 * Sanitizes a URL for safe use in iframe src or similar.
 * Use for user-provided or external URLs to prevent XSS.
 */
@Pipe({ name: 'safeUrl', standalone: true })
export class SafeUrlPipe implements PipeTransform {
    private readonly sanitizer = inject(DomSanitizer);

    transform(url: string | null | undefined): SafeResourceUrl | null {
        if (url == null || url === '') return null;
        return this.sanitizer.bypassSecurityTrustResourceUrl(url);
    }
}
