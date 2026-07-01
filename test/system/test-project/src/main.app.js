import { AvenxApp } from 'avenx-core/runtime';
import DefaultBox from './components/default-box/default-box.component.js';
import UserProfile from './components/user-profile/user-profile.component.js';
import CustomFlatBox from './components/custom-flat-box/custom-flat-box.component.js';
import CustomStructBox from './components/custom-struct-box/custom-struct-box.component.js';

const app = new AvenxApp({ target: '#app' });

app.register('DefaultBox', DefaultBox);
app.register('UserProfile', UserProfile);
app.register('CustomFlatBox', CustomFlatBox);
app.register('CustomStructBox', CustomStructBox);


app.mount('DefaultBox');
// app.mount('UserProfile'); // Uncomment to mount this component
// app.mount('CustomFlatBox'); // Uncomment to mount this component
// app.mount('CustomStructBox'); // Uncomment to mount this component