from django.db import models
from django.utils import timezone
from django.contrib.auth.models import User
from django.urls import reverse
from PIL import Image
from market.models import ItemCategory


class Post(models.Model):
    title = models.CharField(max_length=100)
    summary = models.TextField()
    category = models.ForeignKey(ItemCategory, on_delete=models.CASCADE)
    featured_image = models.ImageField(default='placeholder_item_image.png', upload_to='blog_featured_images',
                                       help_text='Recommended image size (770x470)px. Larger sizes will be reduced')
    content = models.TextField()
    date_posted = models.DateTimeField(default=timezone.now)
    author = models.ForeignKey(User, on_delete=models.CASCADE)

    def __str__(self):
        return self.title

    # -> reduce image size
    def save(self):
        super().save()

        img = Image.open(self.featured_image.path)

        if img.height > 470 or img.width > 700:
            output_size = (450, 450)
            img.thumbnail(output_size)
            img.save(self.featured_image.path)

    def get_absolute_url(self):
        return reverse('post-detail', kwargs={"pk": self.pk})
